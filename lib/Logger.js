'use strict'; // eslint-disable-line strict

const LogLevel = require('./LogLevel.js');
const RequestLogger = require('./RequestLogger.js');
const unserializeUids = require('./Utils.js').unserializeUids;
const Config = require('./Config.js');

class Logger {

    /**
     * This is the constructor of the Logger class. It takes optional
     * configuration parameters, that allow to modify its behavior.
     *
     * @param {Werelogs.Config} config  - An instanciated Werelogs Config object
     *
     * @param {string} name  - The name of the Logger. It can be found later on
     *                         in the log entries.
     *
     * @returns {undefined}
     */
    constructor(config, name) {
        if (!(config instanceof Config)) {
            throw new TypeError('Invalid parameter Type for "config".');
        }
        if (!(typeof name === 'string' || name instanceof String)) {
            throw new TypeError('Invalid parameter Type for "name".');
        }
        this.config = config;
        this.name = name;
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
        const rLog = new RequestLogger(this.config.logger,
                                       this.config.level, this.config.dump,
                                       this.config.end, uids);
        rLog.addDefaultFields({ name: this.name });
        return rLog;
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
        const rLog = new RequestLogger(this.config.logger,
                                       this.config.level, this.config.dump,
                                       this.config.end,
                                       unserializeUids(serializedUids));
        rLog.addDefaultFields({ name: this.name });
        return rLog;
    }

    _doLog(levelName, msg, data) {
        const sLogger = this.config.logger;
        const finalData = { name: this.name, time: Date.now() };
        if (!LogLevel.shouldLog(levelName, this.config.level)) {
            return;
        }
        if (data !== undefined && typeof data !== 'object') {
            sLogger.fatal(
                {
                    callparams: [msg, data],
                },
                'Werelogs API was mis-used.'
                + ' This development error should be fixed ASAP.');
            return;
        }
        if (data) {
            Object.keys(data).forEach(k => {
                finalData[k] = data[k];
            });
        }
        const args = [finalData, msg];
        sLogger[levelName].apply(sLogger, args);
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
