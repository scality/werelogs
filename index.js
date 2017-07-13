const API = require('./lib/api.js');

/*
 * For convenience purposes, we provide an already instanciated API; so that
 * old uses of the imported Logger class can be kept as-is. For quick logging,
 * this also provides a hassle-free way to log using werelogs.
 */
const werelogs = new API();

module.exports = {
    Logger: werelogs.Logger,
    configure: werelogs.reconfigure.bind(werelogs),
    Werelogs: API,
};
