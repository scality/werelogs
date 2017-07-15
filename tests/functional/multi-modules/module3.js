const Werelogs = require('werelogs').Werelogs;

const log = new Werelogs('test-mod3', { logLevel: 'info' }).Logger;

function test() {
    log.error('Logging as error');
}

module.exports = test;
