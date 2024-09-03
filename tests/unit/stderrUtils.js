const assert = require('assert');
const { execFile } = require('child_process');

const stderrUtils = require('../../lib/stderrUtils');

/** Simple regex for ISO YYYY-MM-DDThh:mm:ss.sssZ */
// eslint-disable-next-line max-len
const defaultDateRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+(?:[+-][0-2]\d:[0-5]\d|Z)/;

// eslint-disable-next-line valid-jsdoc
/** another format: Tue, 31 Dec 2024 10:20:30 GMT */
const customDate = () => new Date('2024-12-31T10:20:30.444Z').toUTCString();

describe('stderrUtils', () => {
    const errStackRegex = /Error: TestingError\n(?:.*\sat\s.*\n)+/;

    describe('defaultTimestamp', () => {
        it('should match ISO format', () => {
            assert.match(stderrUtils.defaultTimestamp(), defaultDateRegex);
        });
    });

    describe('printErrorWithTimestamp', () => {
        let stderrText;
        const originalStderrWrite = process.stderr.write;
        const mockedStderrWrite = text => { stderrText = text; return true; };
        const err = new Error('TestingError');
        const origin = 'uncaughtException';

        beforeEach(() => {
            stderrText = undefined;
            process.stderr.write = mockedStderrWrite;
        });

        afterEach(() => {
            process.stderr.write = originalStderrWrite;
            stderrText = undefined;
        });

        it(
            'should write to stderr with current date, origin and stacktrace',
            () => {
                const written = stderrUtils
                    .printErrorWithTimestamp(err, origin);

                assert.strictEqual(written, true);
                const [firstLine, errStack] = stderrText.split(':\n');
                const [errDate, errOrigin] = firstLine.split(': ');

                assert.match(errDate, defaultDateRegex);
                assert.strictEqual(errOrigin, origin);
                assert.strictEqual(errStack, `${err.stack}\n`);
            },
        );

        it(
            'should write to stderr with custom date, origin and stacktrace',
            () => {
                const written = stderrUtils
                    .printErrorWithTimestamp(err, origin, customDate());

                assert.strictEqual(written, true);
                const [firstLine, errStack] = stderrText.split(':\n');
                const [errDate, errOrigin] = firstLine.split(': ');

                assert.strictEqual(errDate, customDate());
                assert.strictEqual(errOrigin, origin);
                assert.strictEqual(errStack, `${err.stack}\n`);
            },
        );
    });

    const execOptions = {
        cwd: __dirname,
        // Subprocess should always stop alone
        // But just in case, kill subprocess after 500ms.
        // Leave enough time for `nyc` that runs slower.
        timeout: 500,
    };

    // Execute in another process to notice the process exit
    // Therefore, looks more like a functional test
    const timeoutHint = (ms, retries) =>
        `Test fixture process timed out after ${ms}ms with ${retries} retries.\n` +
        'Due to nyc coverage first run slowing down process.\nIncrease execOptions.timeout to fix';

    describe('catchAndTimestampUncaughtException', () => {
        [
            { desc: 'with default date' },
            { desc: 'with custom date', date: customDate() },
            { desc: 'with custom exitCode 42', exitCode: 42 },
            { desc: 'without exit on uncaught exception', exitCode: null },
            { desc: 'for unhandled promise', promise: true },
        ].forEach(({
            desc, date, exitCode, promise,
        }) => describe(desc, () => {
            /** for before all hook that doesn't support this.retries */
            let retries = 4;
            let err;
            let stdout;
            let stderr;
            let errStack;
            let errDate;
            let errOrigin;

            before('run process catchUncaughtException', function beforeAllHook(done) {
                execFile(
                    './fixtures/stderrUtils/catchUncaughtException.js',
                    [`${date}`, `${exitCode}`, `${promise}`],
                    execOptions,
                    (subErr, subStdout, subStderr) => {
                        if (subErr?.killed) {
                            retries--;
                            if (retries <= 0) {
                                assert.fail(timeoutHint(execOptions.timeout, retries));
                            }
                            execOptions.timeout *= 2;
                            return beforeAllHook(done);
                        }
                        err = subErr;
                        stdout = subStdout;
                        stderr = subStderr;
                        let firstLine;
                        [firstLine, errStack] = stderr.split(':\n');
                        [errDate, errOrigin] = firstLine.split(': ');
                        return done();
                    },
                );
            });

            if (exitCode === null) {
                it('should not be an error (or timeout)',
                    () => assert.ifError(err));
                it('should have stdout (printed after uncaught exception)',
                    () => assert.match(stdout,
                        /^.*EXECUTED AFTER UNCAUGHT EXCEPTION(?:.|\n)*$/));
            } else {
                it('should be an error',
                    () => assert.ok(err));
                it(`should have exitCode ${exitCode || 1}`,
                    () => assert.strictEqual(err.code, exitCode || 1));
                it('should have empty stdout',
                    () => assert.strictEqual(stdout, ''));
            }

            it('should have stderr',
                () => assert.ok(stderr));
            it('should have date in stderr first line',
                () => (date
                    ? assert.strictEqual(errDate, date)
                    : assert.match(errDate, defaultDateRegex)));

            it('should have origin in stderr first line',
                () => (promise === true
                    ? assert.strictEqual(errOrigin, 'unhandledRejection')
                    : assert.strictEqual(errOrigin, 'uncaughtException')));

            if (!promise) {
                it('should have stack trace on stderr',
                    () => assert.match(errStack, errStackRegex));
            }
        }));
    });

    describe('catchAndTimestampWarning (also tests node onWarning)', () => {
        [
            { desc: 'with default date' },
            { desc: 'with custom date', date: customDate() },
            { desc: 'with deprecation warning', name: 'DeprecationWarning' },
            {
                desc: 'with custom warning',
                name: 'CUSTOM',
                code: 'TEST01',
                detail: 'Some additional detail',
            },
        ].forEach(({
            desc, date, name, code, detail,
        }) => describe(desc, () => {
            /** for before all hook that doesn't support this.retries */
            let retries = 4;
            let err;
            let stdout;
            let stderr;

            before('run process catchWarning', function beforeAllHook(done) {
                execFile(
                    './fixtures/stderrUtils/catchWarning.js',
                    [`${date}`, `${name}`, `${code}`, `${detail}`],
                    execOptions,
                    (subErr, subStdout, subStderr) => {
                        if (subErr?.killed) {
                            retries--;
                            if (retries <= 0) {
                                assert.fail(timeoutHint(execOptions.timeout, retries));
                            }
                            execOptions.timeout *= 2;
                            return beforeAllHook(done);
                        }
                        err = subErr;
                        stdout = subStdout;
                        stderr = subStderr;
                        return done();
                    },
                );
            });

            it('should not be an error (or timeout)',
                () => assert.ifError(err));
            it('should have empty stdout',
                () => assert.strictEqual(stdout, ''));
            it('should have stderr',
                () => assert.ok(stderr));
            it('should have message on stderr first line, then stack trace',
                () => assert.match(stderr,
                    /^.*TestWarningMessage\n(?:\s+at\s.*\n)+/));

            if (code) {
                it('should have code on stderr first line',
                    () => assert.match(stderr, new RegExp(`^.*[${code}]`)));
            }

            if (name) {
                it('should have name on stderr first line',
                    () => assert.match(stderr, new RegExp(`^.*${name}:`)));
            }

            if (detail) {
                it('should have detail on stderr',
                    () => assert.match(stderr, new RegExp(`.*${detail}.*`)));
            }

            it(`should have ${date ? 'custom' : 'default'} date on stderr`,
                () => assert.match(stderr, new RegExp(
                    `\nAbove Warning Date: ${
                        date || defaultDateRegex.source}\n`,
                )));
        }));
    });

    describe('catchAndTimestampStderr', () => {
        [
            { desc: 'with default date' },
            { desc: 'with custom date', date: customDate() },
            { desc: 'with exit code', exitCode: 42 },

        ].forEach(({
            desc, date, exitCode,
        }) => describe(desc, () => {
            /** for before all hook that doesn't support this.retries */
            let retries = 4;
            let err;
            let stdout;
            let stderr;

            before('run process catchStderr', function beforeAllHook(done) {
                execFile(
                    './fixtures/stderrUtils/catchStderr.js',
                    [`${date}`, `${exitCode}`],
                    execOptions,
                    (subErr, subStdout, subStderr) => {
                        if (subErr?.killed) {
                            retries--;
                            if (retries <= 0) {
                                assert.fail(timeoutHint(execOptions.timeout, retries));
                            }
                            execOptions.timeout *= 2;
                            return beforeAllHook(done);
                        }
                        err = subErr;
                        stdout = subStdout;
                        stderr = subStderr;
                        return done();
                    },
                );
            });

            it('should be an error',
                () => assert.ok(err));
            it(`should have exitCode ${exitCode || 1}`,
                () => assert.strictEqual(err.code, exitCode || 1));
            it('should have empty stdout',
                () => assert.strictEqual(stdout, ''));

            it('should have stderr',
                () => assert.ok(stderr));

            // 2024-06-26T15:04:55.364Z: uncaughtException:
            // Error: TestingError
            //     at Object.<anonymous> (catchStderr.js:16:7)
            //     at node:internal/main/run_main_module:22:47
            it('should have error date, origin and stacktrace in stderr',
                () => assert.match(stderr,
                    new RegExp(`${date || defaultDateRegex.source
                    }: uncaughtException:\n${errStackRegex.source}`)));

            // (node:171245) Warning: TestWarningMessage
            //     at Object.<anonymous> (catchStderr.js:14:9)
            //     at node:internal/main/run_main_module:22:47
            // Above Warning Date: 2024-06-26T15:04:55.365Z
            it('should have warning with stacktrace in stderr', () => {
                const trace = 'Warning: TestWarningMessage\n(?:\\s+at\\s.*\n)+';
                const detail = `(?:.|\n)*?(?<=\n)Above Warning Date: ${
                    date || defaultDateRegex.source}\n`;
                assert.match(stderr,
                    new RegExp(`${trace}${detail}`));
            });
        }));
    });
});
