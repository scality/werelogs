const assert = require('assert');
const bunyan = require('bunyan');

const Config = require('../../lib/Config.js');
const logBuffer = new bunyan.RingBuffer({ limit: 1 });

describe('Config', () => {
    beforeEach(() => {
        Config.reset();
    });

    it('should work with default configuration', (done) => {
        assert.doesNotThrow(
            () => {
                Config.logger.info('test message');
            },
            Error);
        done();
    });

    it('log level should be updateable', (done) => {
        Config.update({ level: 'debug' });
        assert.strictEqual(Config.level, 'debug', 'Expected Config\'s log level to be updated.');
        done();
    });

    it('dump threshold should be updateable', (done) => {
        const origDump = Config.dump;
        assert.notStrictEqual(origDump, 'warn', 'Expected original Config.dump to differ from value to update.');
        Config.update({ dump: 'warn' });
        assert.strictEqual(Config.dump, 'warn', 'Expected Config\'s dump threshold to be updated.');
        done();
    });

    it('streams should be updateable', (done) => {
        const origStreams = Config.streams;
        const origLogger = Config.logger;
        Config.update({ streams: [{ type: 'raw', stream: logBuffer }] });
        assert.notStrictEqual(origStreams, Config.streams, 'Expected Config\'s streams to have been updated.');
        assert.notStrictEqual(origLogger, Config.Logger, 'Expected Config\'s logger to have been replaced by update.');
        done();
    });

    it('should not be modified by an empty config object', (done) => {
        const origLevel = Config.level;
        const origDump = Config.dump;
        const origLogger = Config.logger;
        const origStreams = Config.streams;
        Config.update({});
        assert.deepStrictEqual(origLevel, Config.level, 'Expected logging level not to have changed.');
        assert.deepStrictEqual(origDump, Config.dump, 'Expected dump threshold not to have changed.');
        assert.strictEqual(origLogger, Config.logger, 'Expected logger not to have changed.');
        assert.deepStrictEqual(origStreams, Config.streams, 'Expected streams not to have changed.');
        done();
    });
});
