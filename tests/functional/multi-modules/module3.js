const Werelogs = require('werelogs').Logger;  // eslint-disable-line

const log = new Werelogs('test-mod3');

function test() {
    log.error('Logging as error');
}

module.exports = test;
