const Werelogs = require('werelogs').Logger;

const log = new Werelogs('test-mod1');

// eslint-disable-next-line no-redeclare
function test() {
    log.info('Logging as info');
}

module.exports = test;
