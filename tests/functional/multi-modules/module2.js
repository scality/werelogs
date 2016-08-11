const Werelogs = require('werelogs').Logger;

const log = new Werelogs('test-mod2');

function test() {
    log.debug('Logging as debug');
}

module.exports = test;
