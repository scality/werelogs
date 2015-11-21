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
 * @param level {string} The logging level's name to be checked
 *
 * @throw {Error}   A human-readable message that tells which log levels are
 *                  supported.
 */
export function throwIfInvalid(level) {
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
 * @param level {string}        The level of the log entry for which to check
 *                              if it should log
 * @param floorLevel {string}   The configured logging level, acting as a floor
 *                              under which entries are not logged.
 *
 * @return {boolean}    true if the entry of log level 'level' should be output
 *                      false if the entry of log level 'level' should not be
 *                      output
 */
export function shouldLog(level, floorLevel) {
    return logLevels.indexOf(level) >= logLevels.indexOf(floorLevel);
}
