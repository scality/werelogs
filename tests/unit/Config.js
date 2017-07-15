/* eslint-disable max-len */

const assert = require('assert');

const Config = require('../../lib/Config.js');

describe('Config', () => {
    beforeEach(() => {
        this.config = new Config();
        this.config.reset();
    });

    it('should work with default configuration', done => {
        assert.doesNotThrow(
            () => {
                this.config.logger.info('test message');
            },
            Error);
        done();
    });

    it('log level should be updateable', done => {
        this.config.update({ level: 'debug' });
        assert.strictEqual(this.config.level, 'debug', 'Expected Config\'s log level to be updated.');
        done();
    });

    it('dump threshold should be updateable', done => {
        const origDump = this.config.dump;
        assert.notStrictEqual(origDump, 'warn', 'Expected original Config.dump to differ from value to update.');
        this.config.update({ dump: 'warn' });
        assert.strictEqual(this.config.dump, 'warn', 'Expected Config\'s dump threshold to be updated.');
        done();
    });

    it('end logging level should be updateable', done => {
        const origEnd = this.config.end;
        assert.notStrictEqual(origEnd, 'trace', 'Expected original Config.end to differ from value to update.');
        this.config.update({ end: 'trace' });
        assert.strictEqual(this.config.end, 'trace', 'Expected Config\'s end log level to be updated.');
        done();
    });

    it('should not be modified by an empty config object', done => {
        const origLevel = this.config.level;
        const origDump = this.config.dump;
        const origLogger = this.config.logger;
        const origStreams = this.config.streams;
        this.config.update({});
        assert.deepStrictEqual(origLevel, this.config.level, 'Expected logging level not to have changed.');
        assert.deepStrictEqual(origDump, this.config.dump, 'Expected dump threshold not to have changed.');
        assert.strictEqual(origLogger, this.config.logger, 'Expected logger not to have changed.');
        assert.deepStrictEqual(origStreams, this.config.streams, 'Expected streams not to have changed.');
        done();
    });
});
