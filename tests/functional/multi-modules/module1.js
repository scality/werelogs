const Werelogs = require('werelogs').Logger;

const log = new Werelogs('test-mod1');

function test() {
    log.info('Logging as info');
}

module.exports = test;
