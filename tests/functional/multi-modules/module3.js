const Werelogs = require('werelogs').Logger;

const log = new Werelogs('test-mod3');

function test() {
    log.error('Logging as error');
}

module.exports = test;
