const assert = require('assert');

const LogLevel = require('../../lib/LogLevel');

const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

function generateValidThrowTest(level) {
    return function validTest(done) {
        assert.doesNotThrow(
            () => {
                LogLevel.throwIfInvalid(level);
            },
            Error,
            'Expected level to be valid and the function not to throw an Error.',
        );
        done();
    };
}

describe('LogLevel', () => {
    describe('throwIfInvalid(level)', () => {
        it('should throw on invalid string', done => {
            assert.throws(
                () => {
                    LogLevel.throwIfInvalid('invalid');
                },
                RangeError,
                'Expected function to throw an Error instance due to invalid log level.',
            );
            done();
        });

        levels.forEach(level => it(`should not throw on "${level}" level`, generateValidThrowTest(level)));
    });

    describe('shouldLog(level, floor)', () => {
        levels.forEach(level =>
            it(`should return true on "${level}" parameters`, done => {
                assert.strictEqual(
                    LogLevel.shouldLog(level, level),
                    true,
                    `Expected ${level} floor to allow logging ${level} level.`,
                );
                done();
            }),
        );
    });
});
