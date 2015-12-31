import assert from 'assert';

import * as LogLevel from '../../lib/LogLevel.js';
import RequestLogger from '../../lib/RequestLogger.js';

class DummyLogger {

    constructor() {
        this.ops = [];
        this.counts = {
            'trace': 0,
            'debug': 0,
            'info': 0,
            'warn': 0,
            'error': 0,
            'fatal': 0,
        };
    }

    trace(obj, msg) {
        this.ops.push(['trace', [obj, msg]]);
        this.counts.trace += 1;
    }

    debug(obj, msg) {
        this.ops.push(['debug', [obj, msg]]);
        this.counts.debug += 1;
    }

    info(obj, msg) {
        this.ops.push(['info', [obj, msg]]);
        this.counts.info += 1;
    }

    warn(obj, msg) {
        this.ops.push(['warn', [obj, msg]]);
        this.counts.warn += 1;
    }

    error(obj, msg) {
        this.ops.push(['error', [obj, msg]]);
        this.counts.error += 1;
    }

    fatal(obj, msg) {
        this.ops.push(['fatal', [obj, msg]]);
        this.counts.fatal += 1;
    }
}

function computeBehavior(filterLevel, logLevel, testLevel) {
    let value = LogLevel.shouldLog(logLevel, filterLevel) ? 1 : 0;

    if (value === 1 && logLevel !== testLevel) {
        value = 0;
    }

    return {
        value,
        'msg': `Expected ${logLevel} to be called ${value} times with filter level ${filterLevel}.`,
    };
}

function filterGenerator(filterLevel, testLevel) {
    return function testFilter(done) {
        let value;
        let msg;
        const dummyLogger = new DummyLogger();
        const reqLogger = new RequestLogger(dummyLogger, filterLevel, 'fatal');

        switch (testLevel) {
        case 'trace': reqLogger.trace({msg: 'test'}); break;
        case 'debug': reqLogger.debug({msg: 'test'}); break;
        case 'info':  reqLogger.info({msg: 'test'});  break;
        case 'warn':  reqLogger.warn({msg: 'test'});  break;
        case 'error': reqLogger.error({msg: 'test'}); break;
        case 'fatal': reqLogger.fatal({msg: 'test'}); break;
        default:
            done(new Error('Unexpected testLevel name: ', testLevel));
        }

        ({ value, msg } = computeBehavior(filterLevel, 'trace', testLevel));
        assert.strictEqual(dummyLogger.counts.trace, value, msg);
        ({ value, msg } = computeBehavior(filterLevel, 'debug', testLevel));
        assert.strictEqual(dummyLogger.counts.debug, value, msg);
        ({ value, msg } = computeBehavior(filterLevel, 'info', testLevel));
        assert.strictEqual(dummyLogger.counts.info, value, msg);
        ({ value, msg } = computeBehavior(filterLevel, 'warn', testLevel));
        assert.strictEqual(dummyLogger.counts.warn, value, msg);
        ({ value, msg } = computeBehavior(filterLevel, 'error', testLevel));
        assert.strictEqual(dummyLogger.counts.error, value, msg);
        ({ value, msg } = computeBehavior(filterLevel, 'fatal', testLevel));
        assert.strictEqual(dummyLogger.counts.fatal, value, msg);

        done();
    };
}

function runLoggingDumpTest(commandHistory, expectedHistory, expectedCounts, done) {
    const dummyLogger = new DummyLogger();
    const reqLogger = new RequestLogger(dummyLogger, 'trace', 'error');

    commandHistory.every(function doLogWithLevel(val, index) {
        switch (val) {
        case 'trace': reqLogger.trace(index); break;
        case 'debug': reqLogger.debug(index); break;
        case 'info': reqLogger.info(index);   break;
        case 'warn': reqLogger.warn(index);   break;
        case 'error': reqLogger.error(index); break;
        case 'fatal': reqLogger.fatal(index); break;
        default:
            done(new Error('Unexpected logging level name: ', val));
        }
        return true;
    });

    expectedHistory.every((val, index) => {
        assert.strictEqual(dummyLogger.ops[index][0], val[0], 'Expected log entry levels to match.');
        assert.strictEqual(dummyLogger.ops[index][1][1], val[1], 'Expected log entry values to match.');
        return true;
    });
    assert.deepEqual(dummyLogger.counts, expectedCounts);
}


describe('RequestLogger', () => {
    describe('Object Instanciation', () => {
        describe('Logging Levels Initialization', () => {
            it('Throws if LogLevel is higher than dumpThreshold', (done) => {
                assert.throws(
                    () => {
                        return new RequestLogger(undefined, 'fatal', 'debug');
                    },
                    Error,
                    'Dump level "debug" should not be valid with logging level "fatal".');
                done();
            });

            it('Works with LogLevel lesser or equal to DumpLevel', (done) => {
                assert.doesNotThrow(
                    () => {
                        return new RequestLogger(undefined, 'debug', 'fatal');
                    },
                    Error,
                    'Dump level "fatal" should be valid with logging level "debug".');
                done();
            });
        });

        describe('UID Initialization', () => {
            it('defines an UID when none provided', (done) => {
                const dummyLogger = new DummyLogger();
                const reqLogger = new RequestLogger(dummyLogger, 'debug', 'fatal');
                assert.strictEqual(Array.isArray(reqLogger.uids), true, 'Expected uid list to be an Array.');
                assert.strictEqual(reqLogger.uids.length, 1, 'Expected uid list to contain one element.');
                done();
            });

            it('creates an UID array out of the provided UID string', (done) => {
                const dummyLogger = new DummyLogger();
                const uids = 'BasicUid';
                const reqLogger = new RequestLogger(dummyLogger, 'debug', 'fatal', uids);
                assert.strictEqual(Array.isArray(reqLogger.uids), true, 'Expected uid list to be an Array.');
                assert.strictEqual(reqLogger.uids.length, 1, 'Expected uid list to contain one element.');
                assert.strictEqual(reqLogger.uids[0], uids, 'Expected uid list to only contain the value given as argument.');
                done();
            });

            it('expands the UID array when one is provided', (done) => {
                const dummyLogger = new DummyLogger();
                const uids = ['oneuid', 'twouid', 'threeuids'];
                const reqLogger = new RequestLogger(dummyLogger, 'debug', 'fatal', uids);
                assert.strictEqual(Array.isArray(reqLogger.uids), true, 'Expected uid list to be an Array.');
                assert.strictEqual(reqLogger.uids.length, 4, 'Expected uid list to contain four elements.');
                assert.strictEqual(uids.indexOf(reqLogger.uids[3]), -1, 'Expected the last uid of the list to be the new one.');
                done();
            });
        });
    });

    describe('Logging level dump filtering', () => {
        it('Trace level does not filter trace level out',   filterGenerator('trace', 'trace'));
        it('Trace level does not filter debug level out',   filterGenerator('trace', 'debug'));
        it('Trace level does not filter info level out',    filterGenerator('trace', 'info'));
        it('Trace level does not filter warn level out',    filterGenerator('trace', 'warn'));
        it('Trace level does not filter error level out',   filterGenerator('trace', 'error'));
        it('Trace level does not filter fatal level out',   filterGenerator('trace', 'fatal'));

        it('Debug level filters trace level out',           filterGenerator('debug', 'trace'));
        it('Debug level does not filter debug level out',   filterGenerator('debug', 'debug'));
        it('Debug level does not filter info level out',    filterGenerator('debug', 'info'));
        it('Debug level does not filter warn level out',    filterGenerator('debug', 'warn'));
        it('Debug level does not filter error level out',   filterGenerator('debug', 'error'));
        it('Debug level does not filter fatal level out',   filterGenerator('debug', 'fatal'));

        it('Info level filters trace level out',            filterGenerator('info', 'trace'));
        it('Info level filters debug level out',            filterGenerator('info', 'debug'));
        it('Info level does not filter info level out',     filterGenerator('info', 'info'));
        it('Info level does not filter warn level out',     filterGenerator('info', 'warn'));
        it('Info level does not filter error level out',    filterGenerator('info', 'error'));
        it('Info level does not filter fatal level out',    filterGenerator('info', 'fatal'));

        it('Warning level filters trace level out',         filterGenerator('warn', 'trace'));
        it('Warning level filters debug level out',         filterGenerator('warn', 'debug'));
        it('Warning level filters info level out',          filterGenerator('warn', 'info'));
        it('Warning level does not filter warn level out',  filterGenerator('warn', 'warn'));
        it('Warning level does not filter error level out', filterGenerator('warn', 'error'));
        it('Warning level does not filter fatal level out', filterGenerator('warn', 'fatal'));

        it('Error level filters trace level out',           filterGenerator('error', 'trace'));
        it('Error level filters debug level out',           filterGenerator('error', 'debug'));
        it('Error level filters info level out',            filterGenerator('error', 'info'));
        it('Error level filters warn level out',            filterGenerator('error', 'warn'));
        it('Error level does not filter error level out',   filterGenerator('error', 'error'));
        it('Error level does not filter fatal level out',   filterGenerator('error', 'fatal'));

        it('Fatal level filters trace level out',           filterGenerator('fatal', 'trace'));
        it('Fatal level filters debug level out',           filterGenerator('fatal', 'debug'));
        it('Fatal level filters info level out',            filterGenerator('fatal', 'info'));
        it('Fatal level filters warn level out',            filterGenerator('fatal', 'warn'));
        it('Fatal level filters error level out',           filterGenerator('fatal', 'error'));
        it('Fatal level does not filter fatal level out',   filterGenerator('fatal', 'fatal'));
    });


    describe('Log History dumped when logging floor level reached', () => {
        it('Dumping duplicates log entries', (done) => {
            const commandHistory = ['info', 'error'];
            const expectedHistory = [['info', 0], ['info', 0], ['error', 1]];
            const expectedCounts = { trace: 0, debug: 0, info: 2, warn: 0, error: 1, fatal: 0 };

            runLoggingDumpTest(commandHistory, expectedHistory, expectedCounts, done);
            done();
        });

        it('Dumping Keeps logging history order', (done) => {
            const commandHistory = ['trace', 'info', 'debug', 'error'];
            const expectedHistory = [['trace', 0], ['info', 1], ['debug', 2], ['trace', 0], ['info', 1], ['debug', 2], ['error', 3]];
            const expectedCounts = { trace: 2, debug: 2, info: 2, warn: 0, error: 1, fatal: 0 };

            runLoggingDumpTest(commandHistory, expectedHistory, expectedCounts, done);
            done();
        });
    });
});
