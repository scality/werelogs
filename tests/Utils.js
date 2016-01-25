import assert from 'assert';

import * as LogLevel from '../lib/LogLevel.js';

export class DummyLogger {

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

export default function filterGenerator(filterLevel, testLevel, createLogger) {
    return function testFilter(done) {
        let value;
        let msg;
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
