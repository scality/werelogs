'use strict'; // eslint-disable-line strict

const assert = require('assert');

const Utils = require('../Utils.js');
const genericFilterGenerator = Utils.genericFilterGenerator;
const loggingMisuseGenerator = Utils.loggingMisuseGenerator;
const DummyLogger = Utils.DummyLogger;

const Config = require('../../lib/Config.js');
const RequestLogger = require('../../lib/RequestLogger.js');
const Logger = require('../../lib/Logger.js');

/*
 * This function is a thunk-function calling the Utils'  filterGenerator with
 * the right createLogger function, while seemlessly passing through its
 * arguments.
 */
function filterGenerator(logLevel, callLevel) {
    function createModuleLogger(dummyLogger, filterLevel) {
        const logger = new Logger('TestModuleLogger',
            {
                level: filterLevel,
                dump: 'fatal',
            });
        /*
         * Here, patch the Config by setting a specificly designed dummyLogger
         * for testing purposes that will help us collect runtime data.
         */
        /*
         * Not understanding why this line is necessary, see ~line 182
         */
        logger.config.simpleLogger = dummyLogger;

        return logger;
    }

    return genericFilterGenerator(logLevel, callLevel, createModuleLogger);
}

function checkFields(src, result) {
    Object.keys(src).forEach(k => {
        if (src.hasOwnProperty(k)) {
            assert.deepStrictEqual(result[k], src[k]);
        }
    });
    assert.ok(result.hasOwnProperty('time'));
    // Time field should be current give or take 1s
    assert.ok((Date.now() - result.time) < 1000);
}


describe('WereLogs Logger is usable:', () => {
    beforeEach(() => {
        this.config = new Config();
        this.config.reset();
    });

    it('Can be instanciated with only a name', done => {
        assert.doesNotThrow(
            () => new Logger('WereLogsTest'),
            Error,
            'WereLogs Instanciation should not throw any kind of error.');
        done();
    });

    it('Cannot be instanciated with invalid log level', done => {
        assert.throws(
            () => new Logger('test', { level: 'invalidlevel' }),
            RangeError,
            // eslint-disable-next-line max-len
            'WereLogs should not be instanciable without the proper logging levels.');
        done();
    });

    it('Cannot be instanciated with invalid dump threshold level', done => {
        assert.throws(
            () => new Logger('test', { level: 'trace', dump: 'invalidlevel' }),
            RangeError,
            // eslint-disable-next-line max-len
            'WereLogs should not be instanciable without the proper dumping threshold levels.');

        done();
    });

    it('Cannot be instanciated with a non-Array in config.streams', done => {
        assert.throws(
            () => new Logger('test', { streams: process.stdout }),
            Error,
            // eslint-disable-next-line max-len
            'Werelogs should not be instanciable with a stream option that is not an array.');
        done();
    });

    it('Cannot be instanciated with an empty Array in config.streams', done => {
        assert.throws(
            () => new Logger('test', { streams: [] }),
            Error,
            // eslint-disable-next-line max-len
            'Werelogs should not be instanciable with an empty array for the streams option.');
        done();
    });

    it('Cannot set logging level to invalid level at runtime', done => {
        const logger = new Logger('test');
        assert.throws(
            () => {
                logger.setLevel('invalidLevel');
            },
            RangeError,
            // eslint-disable-next-line max-len
            'WereLogs should not be able to set log level to an invalid level.');
        done();
    });

    it('Can set logging level at runtime', done => {
        const logger = new Logger('test');
        assert.doesNotThrow(
            () => {
                logger.setLevel('fatal');
            },
            RangeError,
            'WereLogs should be able to set log level at runtime.');
        done();
    });

    it('Cannot set dump threshold to invalid level at runtime', done => {
        const logger = new Logger('test');
        assert.throws(
            () => {
                logger.setDumpThreshold('invalidLevel');
            },
            RangeError,
            // eslint-disable-next-line max-len
            'WereLogs should not be able to set dump threshold to an invalid level.');
        done();
    });

    it('Can set dump threshold at runtime', done => {
        const logger = new Logger('test');
        assert.doesNotThrow(
            () => {
                logger.setDumpThreshold('fatal');
            },
            RangeError,
            'WereLogs should be able to set dump threshold at runtime.');
        done();
    });

    it('Can create Per-Request Loggers', done => {
        const logger = new Logger('test');
        assert.doesNotThrow(
            () => {
                logger.newRequestLogger();
            },
            Error,
            'Werelogs should not throw when creating a request logger.');
        const reqLogger = logger.newRequestLogger();
        assert(reqLogger instanceof RequestLogger, 'RequestLogger');
        done();
    });

    it('Can create Per-Request Loggers from a Serialized UID Array', done => {
        const logger = new Logger('test');
        assert.doesNotThrow(
            () => {
                logger.newRequestLogger();
            },
            Error,
            // eslint-disable-next-line max-len
            'Werelogs should not throw when creating a request logger from a Serialized UID Array.');
        const reqLogger = logger.newRequestLoggerFromSerializedUids(
            'OneUID:SecondUID:TestUID:YouWinUID');
        assert(reqLogger instanceof RequestLogger, 'RequestLogger');
        assert.deepStrictEqual(reqLogger.getUids().slice(0, -1),
                               ['OneUID', 'SecondUID', 'TestUID', 'YouWinUID']);
        done();
    });

    it('Uses the additional fields as expected', done => {
        const dummyLogger = new DummyLogger();
        const logger = new Logger('test');
        logger.config.simpleLogger = dummyLogger;
        const fields = {
            ip: '127.0.0.1',
            method: 'GET',
            count: 23,
        };
        logger.info('message', fields);
        checkFields(fields, dummyLogger.ops[0][1][0]);
        assert.strictEqual(dummyLogger.ops[0][1][1], 'message');
        done();
    });

    /* eslint-disable max-len */
    describe('Does not crash and logs a fatal message when mis-using its logging API', () => {
        const testValues = [
            { desc: 'a string as second argument', args: ['test', 'second-param-string'] },
            { desc: 'a function as second argument', args: ['test', () => { return; }] }, // eslint-disable-line arrow-body-style
            { desc: 'a Number as second argument', args: ['test', 1] },
            { desc: 'more than 2 arguments', args: ['test', 2, 3, 4] },
        ];
        /* eslint-enable max-len */
        function createMisusableLogger(dummyLogger) {
            const logger = new Logger('test');
            logger.config.simpleLogger = dummyLogger;
            return logger;
        }

        for (let i = 0; i < testValues.length; ++i) {
            const test = testValues[i];
            it(`Does not crash with ${test.desc}`,
               loggingMisuseGenerator(test, createMisusableLogger));
        }
    });
});

/* eslint-disable no-multi-spaces, max-len */
describe('Werelogs Module-level Logger can log as specified by the log level', () => {
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
/* eslint-enable no-multi-spaces, max-len */
