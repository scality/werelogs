/* eslint-disable max-len */

const assert = require('assert');

const Config = require('../../lib/Config.js');

describe('Config', () => {
    beforeEach(() => {
        Config.reset();
    });

    it('should work with default configuration', done => {
        assert.doesNotThrow(
            () => {
                Config.logger.info('test message');
            },
            Error);
        done();
    });

    it('log level should be updateable', done => {
        Config.update({ level: 'debug' });
        assert.strictEqual(Config.level, 'debug', 'Expected Config\'s log level to be updated.');
        done();
    });

    it('dump threshold should be updateable', done => {
        const origDump = Config.dump;
        assert.notStrictEqual(origDump, 'warn', 'Expected original Config.dump to differ from value to update.');
        Config.update({ dump: 'warn' });
        assert.strictEqual(Config.dump, 'warn', 'Expected Config\'s dump threshold to be updated.');
        done();
    });

    it('end logging level should be updateable', done => {
        const origEnd = Config.end;
        assert.notStrictEqual(origEnd, 'trace', 'Expected original Config.end to differ from value to update.');
        Config.update({ end: 'trace' });
        assert.strictEqual(Config.end, 'trace', 'Expected Config\'s end log level to be updated.');
        done();
    });

    it('should not be modified by an empty config object', done => {
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
