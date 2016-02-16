const assert = require('assert');

const bunyan = require('bunyan');

const Werelogs = require('werelogs');
const modules = [
    require('./module1.js'),
    require('./module2.js'),
    require('./module3.js'),
];

describe('Config is shared and unique within one program', () => {
    it('should find all log entries in the RingBuffer with the right module name', (done) => {
        const rBuffer = new bunyan.RingBuffer({ limit: 15 });
        const log = new Werelogs('test-index', {
            level: 'debug',
            dump: 'fatal',
            streams: [{
                type: 'raw',
                stream: rBuffer,
            }],
        });
        modules.forEach((mod) => { mod(); });
        log.warn('Logging as warn');
        const rLog = log.newRequestLogger();
        rLog.info('Logging request as info');
        assert.deepStrictEqual(rBuffer.records.length, 5, 'Expected to see 5 log entries in the ring buffer.');
        assert.deepStrictEqual(rBuffer.records[0].msg, 'Logging as info');
        assert.deepStrictEqual(rBuffer.records[0].name, 'test-mod1');
        assert.deepStrictEqual(rBuffer.records[0].level, 30);
        assert.deepStrictEqual(rBuffer.records[1].msg, 'Logging as debug');
        assert.deepStrictEqual(rBuffer.records[1].name, 'test-mod2');
        assert.deepStrictEqual(rBuffer.records[1].level, 20);
        assert.deepStrictEqual(rBuffer.records[2].msg, 'Logging as error');
        assert.deepStrictEqual(rBuffer.records[2].name, 'test-mod3');
        assert.deepStrictEqual(rBuffer.records[2].level, 50);
        assert.deepStrictEqual(rBuffer.records[3].msg, 'Logging as warn');
        assert.deepStrictEqual(rBuffer.records[3].name, 'test-index');
        assert.deepStrictEqual(rBuffer.records[3].level, 40);
        assert.deepStrictEqual(rBuffer.records[4].msg, 'Logging request as info');
        assert.deepStrictEqual(rBuffer.records[4].name, 'test-index');
        assert.deepStrictEqual(rBuffer.records[4].level, 30);
        assert.notStrictEqual(rBuffer.records[4].req_id, undefined);
        done();
    });
});
