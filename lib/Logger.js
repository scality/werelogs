'use strict'; // eslint-disable-line strict

const LogLevel = require('./LogLevel.js');
const RequestLogger = require('./RequestLogger.js');
const Utils = require('./Utils.js');
const Config = require('./Config.js');
const DefaultFields = require('./DefaultFields.js');

const unserializeUids = Utils.unserializeUids;
const objectCopy = Utils.objectCopy;

class Logger extends DefaultFields {

    /**
     * This is the constructor of the Logger class. It takes optional
     * configuration parameters, that allow to modify its behavior.
     *
     * @param {string|Object} fields  - Deprecated: {string}: The name of the
     *                                  Logger that will be included in the log
     *                                  entries
     *                                  Advised: {Object} A set of fields that
     *                                  will be used as the default fields for
     *                                  this Logger, and will be included in
     *                                  all later log entries.
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
     *
     * @returns {undefined}
     */
    constructor(fields, config) {
        super();
        /* TODO XXX FIXME Remove starting at version 8.0 FIXME XXX TODO
         * vvvvvvvvvvvvvvvvvvvvvvvv */
        if (typeof fields === 'string') {
            this.addDefaultFields({ name: fields });
        } else if (typeof fields === 'object') {
            /* ^^^^^^^^^^^^^^^^^^^^^^^
             * TODO XXX FIXME Remove starting at version 8.0 FIXME XXX TODO */
            this.addDefaultFields(fields);
            /* TODO XXX FIXME Remove starting at version 8.0 FIXME XXX TODO
             * vvvvvvvvvvvvvvvvvvvvvvvv */
        }
        /* ^^^^^^^^^^^^^^^^^^^^^^^
         * TODO XXX FIXME Remove starting at version 8.0 FIXME XXX TODO */
        Config.update(config);
    }

    setLevel(levelName) {
        Config.update({ level: levelName });
    }

    setDumpThreshold(levelName) {
        Config.update({ dump: levelName });
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
        const rLog = new RequestLogger(Config.logger,
                                       Config.level, Config.dump, Config.end,
                                       uids);
        rLog.setParent(this);
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
        const rLog = new RequestLogger(Config.logger,
                                       Config.level, Config.dump, Config.end,
                                       unserializeUids(serializedUids));
        rLog.setParent(this);
        return rLog;
    }

    _doLog(levelName, msg, data) {
        const sLogger = Config.logger;
        if (!LogLevel.shouldLog(levelName, Config.level)) {
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
        const finalData = objectCopy({},
                                     this._dfGetFields(),
                                     { time: Date.now() });
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
