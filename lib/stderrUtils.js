/**
 * @returns {string} a timestamp in ISO format YYYY-MM-DDThh:mm:ss.sssZ
 */
const defaultTimestamp = () => new Date().toISOString();

/**
 * Prints on stderr a timestamp, the origin and the error
 *
 * If no other instructions are needed on uncaughtException,
 * consider using `catchAndTimestampStderr` directly.
 *
 * @example
 * process.on('uncaughtException', (err, origin) => {
 *   printErrorWithTimestamp(err, origin);
 *   // server.close();
 *   // file.close();
 *   process.nextTick(() => process.exit(1));
 * });
 * // Don't forget to timestamp warning
 * catchAndTimestampWarning();
 * @param {Error} err see process event uncaughtException
 * @param {uncaughtException|unhandledRejection} origin see process event
 * @param {string} [date=`defaultTimestamp()`] Date to print
 * @returns {boolean} see process.stderr.write
 */
function printErrorWithTimestamp(
    err, origin, date = defaultTimestamp(),
) {
    return process.stderr.write(`${date}: ${origin}:\n${err.stack}\n`);
}

/**
 * Prefer using `catchAndTimestampStderr` instead of this function.
 *
 * Adds listener for uncaughtException to print with timestamp.
 *
 * If you want to manage the end of the process, you can set exitCode to null.
 * Or use `printErrorWithTimestamp` in your own uncaughtException listener.
 *
 * @param {Function} [dateFct=`defaultTimestamp`] Fct returning a formatted date
 * @param {*} [exitCode=1] On uncaughtException, if not null, `process.exit`
 *                         will be called with this value
 * @returns {undefined}
 */
function catchAndTimestampUncaughtException(
    dateFct = defaultTimestamp, exitCode = 1,
) {
    process.on('uncaughtException', (err, origin) => {
        printErrorWithTimestamp(err, origin, dateFct());
        if (exitCode !== null) {
            process.nextTick(() => process.exit(exitCode));
        }
    });
}

/**
 * Forces the use of `--trace-warnings` and adds a date in warning.detail
 * The warning will be printed by the default `onWarning`
 *
 * @param {string} [dateFct=`defaultTimestamp`] Fct returning a formatted date
 * @returns {undefined}
 */
function catchAndTimestampWarning(dateFct = defaultTimestamp) {
    process.traceProcessWarnings = true;
    // must be executed first, before the default `onWarning`
    process.prependListener('warning', warning => {
        if (warning.detail) {
            // eslint-disable-next-line no-param-reassign
            warning.detail += `\nAbove Warning Date: ${dateFct()}`;
        } else {
            // eslint-disable-next-line no-param-reassign
            warning.detail = `Above Warning Date: ${dateFct()}`;
        }
    });
}

/**
 * Adds listener for uncaughtException and warning to print them with timestamp.
 *
 * If you want to manage the end of the process, you can set exitCode to null.
 * Or use `printErrorWithTimestamp` in your own uncaughtException listener.
 *
 * @example
 * const { stderrUtils } = require('werelogs');
 * // first instruction in your index.js or entrypoint
 * stderrUtils.catchAndTimestampStderr();
 *
 * @param {Function} [dateFct=`defaultTimestamp`] Fct returning a formatted date
 * @param {*} [exitCode=1] On uncaughtException, if not null, `process.exit`
 *                         will be called with this value
 * @returns {undefined}
 */
function catchAndTimestampStderr(
    dateFct = defaultTimestamp, exitCode = 1,
) {
    catchAndTimestampUncaughtException(dateFct, exitCode);
    catchAndTimestampWarning(dateFct);
}

module.exports = {
    defaultTimestamp,
    printErrorWithTimestamp,
    catchAndTimestampUncaughtException,
    catchAndTimestampWarning,
    catchAndTimestampStderr,
};
