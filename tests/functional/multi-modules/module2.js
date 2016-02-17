const Werelogs = require('werelogs');

const log = new Werelogs('test-mod2');

function test() {
    log.debug('Logging as debug');
}

module.exports = test;
