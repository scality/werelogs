'use strict'; // eslint-disable-line strict

const logLevels = [
    'trace',
    'debug',
    'info',
    'warn',
    'error',
    'fatal',
];

/**
 * This function checks whether a Logging level is valid or not.
 *
 * @function throwIfInvalid
 *
 * @param {string} level    The logging level's name to be checked
 *
 * @throw {Error}           A human-readable message that tells which log
 *                          levels are supported.
 * @throw {TypeError}       A human-readable message indicating that the
 *                          provided logging level was not a string
 *
 * @returns {undefined}
 */
function throwIfInvalid(level) {
    if (typeof level !== 'string') {
        throw new TypeError('Logging level should be a string');
    }
    if (logLevels.indexOf(level) === -1) {
        throw new RangeError(`Invalid logging level: ${level} is neither`
                             + ` ${logLevels.join(', ')}.`);
    }
}

/**
 * This function tells whether an entry of the given level should be output,
 * when the logging level configured is 'floorLevel'. This function expects
 * both logging levels to be pre-emptively validated through the throwIfInvalid
 * function.
 *
 * @function shouldLog
 *
 * @param {string} level        The level of the log entry for which to check
 *                              if it should log
 * @param {string} floorLevel   The configured logging level, acting as a floor
 *                              under which entries are not logged.
 *
 * @return {boolean}    true if the entry of log level 'level' should be output
 *                      false if the entry of log level 'level' should not be
 *                      output
 */
function shouldLog(level, floorLevel) {
    return logLevels.indexOf(level) >= logLevels.indexOf(floorLevel);
}

module.exports = {
    throwIfInvalid,
    shouldLog,
};
