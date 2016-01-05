import assert from 'assert';

import RequestLogger from '../../lib/RequestLogger.js';
import Logger from '../../lib/Logger.js';

describe('WereLogs Logger is usable:', () => {
    it('Can be instanciated with only a name', (done) => {
        assert.doesNotThrow(
            () => {
                return new Logger('WereLogsTest');
            },
            Error,
            'WereLogs Instanciation should not throw any kind of error.');
        done();
    });

    it('Cannot be instanciated with invalid log level', (done) => {
        assert.throws(
            () => {
                return new Logger('test', 'invalidlevel');
            },
            RangeError,
            'WereLogs should not be instanciable without the proper logging levels.');
        done();
    });

    it('Cannot be instanciated with invalid dump threshold level', (done) => {
        assert.throws(
            () => {
                return new Logger('test', 'trace', 'invalidlevel');
            },
            RangeError,
            'WereLogs should not be instanciable without the proper dumping threshold levels.');

        done();
    });

    it('Cannot set logging level to invalid level at runtime', (done) => {
        const logger = new Logger('test');
        assert.throws(
            () => {
                logger.setLevel('invalidLevel');
            },
            RangeError,
            'WereLogs should not be able to set log level to an invalid level.');
        done();
    });

    it('Can set logging level at runtime', (done) => {
        const logger = new Logger('test');
        assert.doesNotThrow(
            () => {
                logger.setLevel('fatal');
            },
            RangeError,
            'WereLogs should be able to set log level at runtime.');
        done();
    });

    it('Can create Per-Request Loggers', (done) => {
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

    it('Can create Per-Request Loggers from a Serialized UID Array', (done) => {
        const logger = new Logger('test');
        assert.doesNotThrow(
            () => {
                logger.newRequestLogger();
            },
            Error,
            'Werelogs should not throw when creating a request logger from a Serialized UID Array.');
        const reqLogger = logger.newRequestLoggerFromSerializedUids('OneUID:SecondUID:TestUID:YouWinUID');
        assert(reqLogger instanceof RequestLogger, 'RequestLogger');
        assert.deepStrictEqual(reqLogger.getUids().slice(0, -1), ['OneUID', 'SecondUID', 'TestUID', 'YouWinUID']);
        done();
    });
});
