'use strict';

const assert = require('assert');

const LogLevel = require('../lib/LogLevel.js');

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

function genericFilterGenerator(filterLevel, testLevel, createLogger) {
    return function testFilter(done) {
        let retObj;
        const dummyLogger = new DummyLogger();
        const logger = createLogger(dummyLogger, filterLevel);

        switch (testLevel) {
        case 'trace': logger.trace('test trace'); break;
        case 'debug': logger.debug('test debug'); break;
        case 'info':  logger.info('test info');  break;
        case 'warn':  logger.warn('test warn');  break;
        case 'error': logger.error('test error'); break;
        case 'fatal': logger.fatal('test fatal'); break;
        default:
            done(new Error('Unexpected testLevel name: ', testLevel));
        }

        retObj = computeBehavior(filterLevel, 'trace', testLevel);
        assert.strictEqual(dummyLogger.counts.trace, retObj.value, retObj.msg);
        retObj = computeBehavior(filterLevel, 'debug', testLevel);
        assert.strictEqual(dummyLogger.counts.debug, retObj.value, retObj.msg);
        retObj = computeBehavior(filterLevel, 'info', testLevel);
        assert.strictEqual(dummyLogger.counts.info, retObj.value, retObj.msg);
        retObj = computeBehavior(filterLevel, 'warn', testLevel);
        assert.strictEqual(dummyLogger.counts.warn, retObj.value, retObj.msg);
        retObj = computeBehavior(filterLevel, 'error', testLevel);
        assert.strictEqual(dummyLogger.counts.error, retObj.value, retObj.msg);
        retObj = computeBehavior(filterLevel, 'fatal', testLevel);
        assert.strictEqual(dummyLogger.counts.fatal, retObj.value, retObj.msg);

        done();
    };
}

function loggingMisuseGenerator(test, createLogger) {
    return function generatedLogAPIMisuseTest(done) {
        const dummyLogger = new DummyLogger();
        const logger = createLogger(dummyLogger);
        assert.doesNotThrow(
            () => {
                logger.info.apply(logger, test.args);
            },
            Error,
            'Werelogs should not throw with ' + test.desc);
        assert(dummyLogger.ops[0][0], 'fatal',
               'Expected the Module Logger to have logged a fatal message.');
        done();
    };
}

module.exports = {
    DummyLogger,
    genericFilterGenerator,
    loggingMisuseGenerator,
};
