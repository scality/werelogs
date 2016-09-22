'use strict'; // eslint-disable-line strict

const assert = require('assert');

const LogLevel = require('../../lib/LogLevel.js');

function generateValidThrowTest(level) {
    return function validTest(done) {
        assert.doesNotThrow(
            () => {
                LogLevel.throwIfInvalid(level);
            },
            Error,
            'Expected level to be valid and '
            + 'the function not to throw an Error.');
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
                'Expected function to throw an Error instance due to '
                + 'invalid log level.');
            done();
        });

        it('should not throw on "trace" level',
           generateValidThrowTest('trace'));

        it('should not throw on "debug" level',
           generateValidThrowTest('debug'));

        it('should not throw on "info" level',
           generateValidThrowTest('info'));

        it('should not throw on "warn" level',
           generateValidThrowTest('warn'));

        it('should not throw on "error" level',
           generateValidThrowTest('error'));

        it('should not throw on "fatal" level',
           generateValidThrowTest('fatal'));
    });

    describe('shouldLog(level, floor)', () => {
        it('should return true on "trace" parameters', done => {
            assert.strictEqual(
                LogLevel.shouldLog('trace', 'trace'),
                true,
                'Expected trace floor to allow logging trace level.');
            done();
        });

        it('should return true on "debug" parameters', done => {
            assert.strictEqual(
                LogLevel.shouldLog('debug', 'debug'),
                true,
                'Expected debug floor to allow logging debug level.');
            done();
        });

        it('should return true on "info" parameters', done => {
            assert.strictEqual(
                LogLevel.shouldLog('info', 'info'),
                true,
                'Expected info floor to allow logging info level.');
            done();
        });

        it('should return true on "warn" parameters', done => {
            assert.strictEqual(
                LogLevel.shouldLog('warn', 'warn'),
                true,
                'Expected warn floor to allow logging warn level.');
            done();
        });

        it('should return true on "error" parameters', done => {
            assert.strictEqual(
                LogLevel.shouldLog('error', 'error'),
                true,
                'Expected error floor to allow logging error level.');
            done();
        });

        it('should return true on "fatal" parameters', done => {
            assert.strictEqual(
                LogLevel.shouldLog('fatal', 'fatal'),
                true,
                'Expected fatal floor to allow logging fatal level.');
            done();
        });
    });
});
