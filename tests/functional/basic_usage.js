'use strict'; // eslint-disable-line strict

const assert = require('assert');
const PassThrough = require('stream').PassThrough;
const pass = new PassThrough;

const werelogs = require('werelogs');

// With PassThrough, SimpleLogger can use it as Writeable stream and all the
// data being written can be read into a variable
const logBuffer = {
    records: [],
};
pass.on('data', data => {
    logBuffer.records.push(data.toString());
});

werelogs.configure({
    level: 'info',
    dump: 'error',
    streams: [{
        stream: pass,
        type: 'raw',
    }],
});

function createModuleLogger() {
    return new werelogs.Logger('FT-test');
}

function checkFields(fields) {
    const record = JSON.parse(logBuffer.records[0].trim());
    Object.keys(fields).forEach(k => {
        if (fields.hasOwnProperty(k)) {
            assert.deepStrictEqual(record[k], fields[k]);
        }
    });
}

function parseLogEntry() {
    return JSON.parse(logBuffer.records[0].trim());
}

describe('Werelogs is usable as a dependency', () => {
    describe('Usage of the ModuleLogger', () => {
        afterEach(() => {
            logBuffer.records = [];
        });
        it('Should be able to create a logger', done => {
            assert.doesNotThrow(
                createModuleLogger,
                Error,
                'Werelogs threw an exception trying to create a ModuleLogger.'
            );
            done();
        });

        it('Should be able to log a simple message', done => {
            const logger = createModuleLogger();
            const msg = 'This is a simple message';
            logger.info(msg);
            assert.strictEqual(parseLogEntry().message, msg);
            done();
        });

        it('Should be able to log a message and additional fields', done => {
            const logger = createModuleLogger();
            const msg = 'This is a message with added fields';
            const fields = { errorCode: 9, description: 'TestError',
                             options: { dump: false } };
            logger.info(msg, fields);
            assert.strictEqual(parseLogEntry().message, msg);
            checkFields(fields);
            done();
        });
    });

    describe('Usage of the RequestLogger', () => {
        afterEach(() => {
            logBuffer.records = [];
        });
        it('Should be able to create a logger', done => {
            assert.doesNotThrow(
                () => createModuleLogger().newRequestLogger(),
                Error,
                'Werelogs threw an exception trying to create a ModuleLogger.'
            );
            done();
        });

        it('Should be able to log a simple message', done => {
            const logger = createModuleLogger().newRequestLogger();
            const msg = 'This is a simple message';
            logger.info(msg);
            assert.strictEqual(parseLogEntry().message, msg);
            done();
        });

        it('Should be able to log a message and additional fields', done => {
            const logger = createModuleLogger().newRequestLogger();
            const msg = 'This is a message with added fields';
            const fields = { errorCode: 9, description: 'TestError',
                             options: { dump: false } };
            logger.info(msg, fields);
            assert.strictEqual(parseLogEntry().message, msg);
            checkFields(fields);
            done();
        });
    });
});
