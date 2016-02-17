const Werelogs = require('werelogs');

const log = new Werelogs('test-mod1');

function test() {
    log.info('Logging as info');
}

module.exports = test;
