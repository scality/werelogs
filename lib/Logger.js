'use strict';

const bunyan = require('bunyan');

const LogLevel = require('./LogLevel.js');
const RequestLogger = require('./RequestLogger.js');
const unserializeUids = require('./Utils.js').unserializeUids;

class Logger {

    /**
     * This is the constructor of the Logger class. It takes optional
     * configuration parameters, that allow to modify its behavior.
     *
     * @param {string} name  - The name of the Logger. It can be found later on in
     *                         the log entries.
     *
     * @param {object} config         - A configuration object for werelogs.
     * @param {string} config.level   - The string name of the logging level
     *                                  ('trace', 'debug', 'info', 'warn',
     *                                  'error' and 'fatal' in order of
     *                                  importance.)
     * @param {string} config.dump    - The string name of the log dumping level
     *                                  ('trace', 'debug', 'info', 'warn',
     *                                  'error' and 'fatal' in order of
     *                                  importance.)
     * @param {object[]} config.streams   - The array of streams into which to log.
     *                                      Their configuration is directly
     *                                      related to the expected bunyan
     *                                      streams array, for compatibility
     *                                      purposes (except that the 'level'
     *                                      field is not accounted for)
     *
     * @see [Bunyan's documentation]{@link
     * https://github.com/trentm/node-bunyan/blob/master/README.md#streams} for
     * a more detailed description of the streams array configuration.
     *
     * @returns {undefined}
     */
    constructor(name, config) {
        const checkedConfig = config || {};
        this.name = name;

        if (checkedConfig.hasOwnProperty('level')) {
            LogLevel.throwIfInvalid(checkedConfig.level);
            this.logLevel = checkedConfig.level;
        } else {
            this.logLevel = 'info';
        }

        if (checkedConfig.hasOwnProperty('dump')) {
            LogLevel.throwIfInvalid(checkedConfig.dump);
            this.dumpThreshold = checkedConfig.dump;
        } else {
            this.dumpThreshold = 'error';
        }

        if (checkedConfig.hasOwnProperty('streams')) {
            if (!Array.isArray(checkedConfig.streams)) {
                throw new Error('WereLogs config.streams must be an Array of Writeable Streams.');
            }
            if (!checkedConfig.streams.length) {
                throw new Error('Werelogs config.streams must contain at least one stream.');
            }
            this.streams = checkedConfig.streams.map((stream) => {
                stream.level = 'trace';
                return stream;
            });
        } else {
            this.streams = [{ level: 'trace', stream: process.stdout }];
        }

        this.bLogger = bunyan.createLogger({
            name: this.name,
            streams: this.streams,
        });
    }

    setLevel(levelName) {
        LogLevel.throwIfInvalid(levelName);
        this.logLevel = levelName;
    }

    setDumpThreshold(levelName) {
        LogLevel.throwIfInvalid(levelName);
        this.dumpThreshold = levelName;
    }

    /**
     * This method creates a Request Logger using an array of UIDs or an
     * explicit UID to use as the origin request ID.
     *
     * @param {(string|string[]|undefined)} uids - The uid List to set
     *
     * @returns {RequestLogger}                 A Valid Request Logger
     */
    newRequestLogger(uids) {
        return new RequestLogger(this.bLogger,
                                 this.logLevel, this.dumpThreshold,
                                 uids);
    }

    /**
     * This method creates a Request Logger using a serialized list of UIDs to
     * set the UID list into the newly created Request Logger..
     *
     * @param {string} serializedUids - The Serialized UID list
     *
     * @returns {RequestLogger}         A Valid Request Logger
     */
    newRequestLoggerFromSerializedUids(serializedUids) {
        return new RequestLogger(this.bLogger,
                                 this.logLevel, this.dumpThreshold,
                                 unserializeUids(serializedUids));
    }

    _doLog(levelName, msg, data) {
        if (!LogLevel.shouldLog(levelName, this.logLevel)) {
            return;
        }
        if (data !== undefined && typeof data !== 'object') {
            this.bLogger.fatal(
                {
                    'callparams': [ msg, data ],
                },
                'Werelogs API was mis-used.'
                + ' This development error should be fixed ASAP.');
            return;
        }
        const args = [ msg ];
        if (data) {
            args.unshift(data);
        }
        this.bLogger[levelName].apply(this.bLogger, args);
    }

    /**
     * Logging function to write a trace-level log entry.
     *
     * @param {string} msg    - The message string to include in the log entry.
     * @param {object} [data] - The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     *
     * @returns {undefined}
     */
    trace(msg, data) {
        this._doLog('trace', msg, data);
    }

    /**
     * Logging function to write a debug-level log entry.
     *
     * @param {string} msg    - The message string to include in the log entry.
     * @param {object} [data] - The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     *
     * @returns {undefined}
     */
    debug(msg, data) {
        this._doLog('debug', msg, data);
    }

    /**
     * Logging function to write a info-level log entry.
     *
     * @param {string} msg    - The message string to include in the log entry.
     * @param {object} [data] - The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     *
     * @returns {undefined}
     */
    info(msg, data) {
        this._doLog('info', msg, data);
    }

    /**
     * Logging function to write a warn-level log entry.
     *
     * @param {string} msg    - The message string to include in the log entry.
     * @param {object} [data] - The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     *
     * @returns {undefined}
     */
    warn(msg, data) {
        this._doLog('warn', msg, data);
    }

    /**
     * Logging function to write a error-level log entry.
     *
     * @param {string} msg    - The message string to include in the log entry.
     * @param {object} [data] - The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     *
     * @returns {undefined}
     */
    error(msg, data) {
        this._doLog('error', msg, data);
    }

    /**
     * Logging function to write a fatal-level log entry.
     *
     * @param {string} msg    - The message string to include in the log entry.
     * @param {object} [data] - The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     *
     * @returns {undefined}
     */
    fatal(msg, data) {
        this._doLog('fatal', msg, data);
    }
}

module.exports = Logger;
