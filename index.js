const API = require('./lib/api.js');
const stderrUtils = require('./lib/stderrUtils');

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
    /**
     * Timestamp logs going to stderr
     *
     * @example <caption>Simplest usage</caption>
     * ```
     * const { stderrUtils } = require('werelogs');
     * stderrUtils.catchAndTimestampStderr();
     * ```
     *
     * @example <caption>Manage process exit</caption>
     * ```
     * const { stderrUtils } = require('werelogs');
     * // set exitCode to null to keep process running on uncaughtException
     * stderrUtils.catchAndTimestampStderr(undefined, null);
     * // application init
     * process.on('uncaughtException', (err) => {
     *     // custom handling, close connections, files
     *     this.worker.kill(); // or process.exit(1);
     * });
     * // Note you could use prependListener to execute your callback first
     * // and then let stderrUtils exit the process.
     * ```
     *
     * @example <caption>Custom listener</caption>
     * ```
     * const { stderrUtils } = require('werelogs');
     * stderrUtils.catchAndTimestampWarning();
     * // application init
     * process.on('uncaughtException', (err, origin) => {
     *     stderrUtils.printErrorWithTimestamp(err, origin);
     *     // close and stop everything
     *     process.exit(1);
     * });
     * ```
     */
    stderrUtils,
};
