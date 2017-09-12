const assert = require('assert');
const PassThrough = require('stream').PassThrough;

const Werelogs = require('werelogs');  // eslint-disable-line
const modules = [
    require('./module1.js'),
    require('./module2.js'),
    require('./module3.js'),
];
const pass = new PassThrough;

const logBuffer = {
    records: [],
};
pass.on('data', data => {
    logBuffer.records.push(JSON.parse(data.toString().trim()));
});

describe('Config is shared and unique within one API', () => {
    it('should find all log entries in the RingBuffer with the right ' +
       'module name', done => {
        Werelogs.configure({
            level: 'debug',
            dump: 'fatal',
            streams: [{
                type: 'raw',
                stream: pass,
            }],
        });
        const log = new Werelogs.Logger('test-index');
        modules.forEach(mod => { mod(); });
        log.warn('Logging as warn');
        const rLog = log.newRequestLogger();
        rLog.info('Logging request as info');
        /* eslint-disable max-len */
        assert.deepStrictEqual(logBuffer.records.length, 5, 'Expected to see 5 log entries in the ring buffer.');
        assert.deepStrictEqual(logBuffer.records[0].message, 'Logging as info');
        assert.deepStrictEqual(logBuffer.records[0].name, 'test-mod1');
        assert.deepStrictEqual(logBuffer.records[0].level, 'info');
        assert.deepStrictEqual(logBuffer.records[1].message, 'Logging as debug');
        assert.deepStrictEqual(logBuffer.records[1].name, 'test-mod2');
        assert.deepStrictEqual(logBuffer.records[1].level, 'debug');
        assert.deepStrictEqual(logBuffer.records[2].message, 'Logging as error');
        assert.deepStrictEqual(logBuffer.records[2].name, 'test-mod3');
        assert.deepStrictEqual(logBuffer.records[2].level, 'error');
        assert.deepStrictEqual(logBuffer.records[3].message, 'Logging as warn');
        assert.deepStrictEqual(logBuffer.records[3].name, 'test-index');
        assert.deepStrictEqual(logBuffer.records[3].level, 'warn');
        assert.deepStrictEqual(logBuffer.records[4].message, 'Logging request as info');
        assert.deepStrictEqual(logBuffer.records[4].name, 'test-index');
        assert.deepStrictEqual(logBuffer.records[4].level, 'info');
        assert.notStrictEqual(logBuffer.records[4].req_id, undefined);
        /* eslint-enable max-len */
        done();
    });
});
