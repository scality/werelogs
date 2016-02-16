const Werelogs = require('werelogs');

const log = new Werelogs('test-mod3');

function test() {
    log.error('Logging as error');
}

module.exports = test;
