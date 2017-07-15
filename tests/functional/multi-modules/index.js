const assert = require('assert');
const PassThrough = require('stream').PassThrough;

const Werelogs = require('werelogs').Werelogs;
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

describe('Configs are independent for each logger', () => {
    it('should show only logs within one logger and level should ' +
    'not be impacted by other logger instances', done => {
        const log = new Werelogs('test-index', {
            level: 'debug',
            dump: 'fatal',
            streams: [{
                type: 'raw',
                stream: pass,
            }],
        }).Logger;
        modules.forEach(mod => { mod(); });
        log.debug('Logging as debug');
        log.warn('Logging as warn');
        const rLog = log.newRequestLogger();
        rLog.info('Logging request as info');
        /* eslint-disable max-len */
        assert.deepStrictEqual(logBuffer.records.length, 3, 'Expected to see 3 log entries in the ring buffer.');
        assert.deepStrictEqual(logBuffer.records[0].message, 'Logging as debug');
        assert.deepStrictEqual(logBuffer.records[0].name, 'test-index');
        assert.deepStrictEqual(logBuffer.records[0].level, 'debug');
        assert.deepStrictEqual(logBuffer.records[1].message, 'Logging as warn');
        assert.deepStrictEqual(logBuffer.records[1].name, 'test-index');
        assert.deepStrictEqual(logBuffer.records[1].level, 'warn');
        assert.deepStrictEqual(logBuffer.records[2].message, 'Logging request as info');
        assert.deepStrictEqual(logBuffer.records[2].name, 'test-index');
        assert.deepStrictEqual(logBuffer.records[2].level, 'info');
        assert.deepStrictEqual(logBuffer.records[3], undefined);
        /* eslint-enable max-len */
        done();
    });
});
