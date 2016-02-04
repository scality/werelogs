const assert = require('assert');
const bunyan = require('bunyan');

const Logger = require('werelogs');
const logBuffer = new bunyan.RingBuffer({ limit: 1 });

function createModuleLogger() {
    return new Logger('FT-test', {
        level: 'info',
        dump: 'error',
        streams: [{
            type: 'raw',
            stream: logBuffer,
        }],
    });
}

function checkFields(fields) {
    Object.keys(fields).forEach((k) => {
        if (fields.hasOwnProperty(k)) {
            assert.deepStrictEqual(logBuffer.records[0][k], fields[k]);
        }
    });
}

describe('Werelogs is usable as a dependency', () => {
    describe('Usage of the ModuleLogger', () => {
        it('Should be able to create a logger', (done) => {
            assert.doesNotThrow(
                createModuleLogger,
                Error,
                'Werelogs threw an exception trying to create a ModuleLogger.'
            );
            done();
        });

        it('Should be able to log a simple message', (done) => {
            const logger = createModuleLogger();
            const msg = 'This is a simple message';
            logger.info(msg);
            assert.strictEqual(logBuffer.records[0].msg, msg);
            done();
        });

        it('Should be able to log a message and additional fields', (done) => {
            const logger = createModuleLogger();
            const msg = 'This is a message with added fields';
            const fields = { errorCode: 9, description: 'TestError', options: { dump: false } };
            logger.info(msg, fields);
            assert.strictEqual(logBuffer.records[0].msg, msg);
            checkFields(fields);
            done();
        });
    });

    describe('Usage of the RequestLogger', () => {
        it('Should be able to create a logger', (done) => {
            assert.doesNotThrow(
                () => {
                    return createModuleLogger().newRequestLogger();
                },
                Error,
                'Werelogs threw an exception trying to create a ModuleLogger.'
            );
            done();
        });

        it('Should be able to log a simple message', (done) => {
            const logger = createModuleLogger().newRequestLogger();
            const msg = 'This is a simple message';
            logger.info(msg);
            assert.strictEqual(logBuffer.records[0].msg, msg);
            done();
        });

        it('Should be able to log a message and additional fields', (done) => {
            const logger = createModuleLogger().newRequestLogger();
            const msg = 'This is a message with added fields';
            const fields = { errorCode: 9, description: 'TestError', options: { dump: false } };
            logger.info(msg, fields);
            assert.strictEqual(logBuffer.records[0].msg, msg);
            checkFields(fields);
            done();
        });
    });
});
