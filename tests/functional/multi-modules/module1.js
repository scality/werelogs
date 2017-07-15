const Werelogs = require('werelogs').Werelogs;

const log = new Werelogs('test-mod1').Logger;

function test() {
    log.info('Logging as info');
}

module.exports = test;
