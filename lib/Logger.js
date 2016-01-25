import bunyan from 'bunyan';

import * as LogLevel from './LogLevel.js';
import RequestLogger from './RequestLogger.js';
import { unserializeUids } from './Utils.js';

export default class Logger {

    /**
     * This is the constructor of the Logger class. It takes optional
     * configuration parameters, that allow to modify its behavior.
     *
     * @param name {string} The name of the Logger. It can be found later on in
     *                      the log entries.
     *
     * @param config {Object} A configuration object for werelogs. It may
     *                        contain the following fields:
     *                         - 'level', being the string name of the logging
     *                         level
     *                         - 'dump', being the string name of the logging
     *                         dump Threshold
     *                         - 'streams', being an array of Objects to be
     *                         used by the underlying library bunyan as the
     *                         'streams' configuration field, for compatibility
     *                         (and simplicity of werelog's code) purposes. As
     *                         such, the streams are left almost untouched,
     *                         except the level that is forced to 'trace', as
     *                         werelogs is internally managning the logging
     *                         level (due to the dump threshold mecanisms)
     */
    constructor(name, config = {}) {
        this.name = name;

        if (config.hasOwnProperty('level')) {
            LogLevel.throwIfInvalid(config.level);
            this.logLevel = config.level;
        } else {
            this.logLevel = 'info';
        }

        if (config.hasOwnProperty('dump')) {
            LogLevel.throwIfInvalid(config.dump);
            this.dumpThreshold = config.dump;
        } else {
            this.dumpThreshold = 'error';
        }

        if (config.hasOwnProperty('streams')) {
            if (!Array.isArray(config.streams)) {
                throw new Error('WereLogs config.streams must be an Array of Writeable Streams.');
            }
            if (!config.streams.length) {
                throw new Error('Werelogs config.streams must contain at least one stream.');
            }
            this.streams = config.streams.map((stream) => {
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
     * @param {string|array|undefined} the uid List to set
     *
     * @returns {RequestLogger} a Valid Request Logger
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
     * @param {string} the Serialized UID list
     *
     * @returns {RequestLogger} a Valid Request Logger
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
        this.bLogger[levelName].call(this.bLogger, data, msg);
    }

    /**
     * Logging function to write a trace-level log entry.
     *
     * @params {String} msg     The message string to include in the log entry.
     * @params {Object} data    The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     */
    trace(msg, data) {
        this._doLog('trace', msg, data);
    }

    /**
     * Logging function to write a debug-level log entry.
     *
     * @params {String} msg     The message string to include in the log entry.
     * @params {Object} data    The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     */
    debug(msg, data) {
        this._doLog('debug', msg, data);
    }

    /**
     * Logging function to write a info-level log entry.
     *
     * @params {String} msg     The message string to include in the log entry.
     * @params {Object} data    The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     */
    info(msg, data) {
        this._doLog('info', msg, data);
    }

    /**
     * Logging function to write a warn-level log entry.
     *
     * @params {String} msg     The message string to include in the log entry.
     * @params {Object} data    The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     */
    warn(msg, data) {
        this._doLog('warn', msg, data);
    }

    /**
     * Logging function to write a error-level log entry.
     *
     * @params {String} msg     The message string to include in the log entry.
     * @params {Object} data    The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     */
    error(msg, data) {
        this._doLog('error', msg, data);
    }

    /**
     * Logging function to write a fatal-level log entry.
     *
     * @params {String} msg     The message string to include in the log entry.
     * @params {Object} data    The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     */
    fatal(msg, data) {
        this._doLog('fatal', msg, data);
    }
}
