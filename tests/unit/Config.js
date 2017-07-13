/* eslint-disable max-len */

const assert = require('assert');

const Config = require('../../lib/Config.js');

describe('Config', () => {
    const config = new Config();

    beforeEach(() => {
        config.reset();
    });

    it('should work with default configuration', done => {
        assert.doesNotThrow(
            () => {
                config.logger.info('test message');
            },
            Error);
        done();
    });

    it('log level should be updateable', done => {
        config.update({ level: 'debug' });
        assert.strictEqual(config.level, 'debug', 'Expected config\'s log level to be updated.');
        done();
    });

    it('dump threshold should be updateable', done => {
        const origDump = config.dump;
        assert.notStrictEqual(origDump, 'warn', 'Expected original config.dump to differ from value to update.');
        config.update({ dump: 'warn' });
        assert.strictEqual(config.dump, 'warn', 'Expected config\'s dump threshold to be updated.');
        done();
    });

    it('end logging level should be updateable', done => {
        const origEnd = config.end;
        assert.notStrictEqual(origEnd, 'trace', 'Expected original config.end to differ from value to update.');
        config.update({ end: 'trace' });
        assert.strictEqual(config.end, 'trace', 'Expected config\'s end log level to be updated.');
        done();
    });

    it('should not be modified by an empty config object', done => {
        const origLevel = config.level;
        const origDump = config.dump;
        const origLogger = config.logger;
        const origStreams = config.streams;
        config.update({});
        assert.deepStrictEqual(origLevel, config.level, 'Expected logging level not to have changed.');
        assert.deepStrictEqual(origDump, config.dump, 'Expected dump threshold not to have changed.');
        assert.strictEqual(origLogger, config.logger, 'Expected logger not to have changed.');
        assert.deepStrictEqual(origStreams, config.streams, 'Expected streams not to have changed.');
        done();
    });
});
