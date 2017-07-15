const Werelogs = require('werelogs').Werelogs;

const log = new Werelogs('test-mod2').Logger;

function test() {
    log.debug('Logging as debug');
}

module.exports = test;
