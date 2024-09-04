const Werelogs = require('werelogs').Logger;   

const log = new Werelogs('test-mod3');

// eslint-disable-next-line no-redeclare
function test() {
    log.error('Logging as error');
}

module.exports = test;
