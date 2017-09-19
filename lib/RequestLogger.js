'use strict'; // eslint-disable-line strict

const assert = require('assert');

const LogLevel = require('./LogLevel.js');
const Utils = require('./Utils.js');
const serializeUids = Utils.serializeUids;
const generateUid = Utils.generateUid;
const objectCopy = Utils.objectCopy;

function ensureUidValidity(uid) {
    if (uid.indexOf(':') !== -1) {
        throw new Error(`RequestLogger UID "${uid}" contains an illegal ` +
                        'character: \':\'.');
    }
    return uid;
}

class EndLogger {
    constructor(reqLogger) {
        this.logger = reqLogger;
        this.fields = {};
    }

    augmentedLog(level, msg, data) {
        assert.strictEqual(this.logger.elapsedTime, null, 'The logger\'s'
                           + 'end() wrapper should not be called more than'
                           + ' once.');
        // We can alter current instance, as it won't be usable after this
        // call.
        this.fields = objectCopy(this.fields, data || {});
        return this.logger.log(level, msg, this.fields, true);
    }

    /**
     * This function allows the user to add default fields to include into all
     * JSON log entries generated through this request logger. As this function
     * attempt not to modify the provided fields object, it copies the field
     * into a new object for safe keeping.
     *
     * @param {object} fields   The dictionnary of additional fields to include
     *                          by default for this instance of the
     *                          RequestLogger.
     *
     * @returns {object}        The previous set of default fields (can be
     *                          safely ignored).
     */
    addDefaultFields(fields) {
        const oldFields = this.fields;
        this.fields = objectCopy({}, this.fields, fields);
        return oldFields;
    }

    /**
     * Logging function to write a trace-level log entry as the last log entry.
     *
     * @param {string} msg    - The message string to include in the log entry.
     * @param {object} [data] - The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     *
     * @returns {undefined}
     */
    trace(msg, data) {
        this.augmentedLog('trace', msg, data);
    }

    /**
     * Logging function to write a debug-level log entry as the last log entry.
     *
     * @param {string} msg    - The message string to include in the log entry.
     * @param {object} [data] - The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     *
     * @returns {undefined}
     */
    debug(msg, data) {
        this.augmentedLog('debug', msg, data);
    }

    /**
     * Logging function to write a info-level log entry as the last log entry.
     *
     * @param {string} msg    - The message string to include in the log entry.
     * @param {object} [data] - The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     *
     * @returns {undefined}
     */
    info(msg, data) {
        this.augmentedLog('info', msg, data);
    }

    /**
     * Logging function to write a warn-level log entry as the last log entry.
     *
     * @param {string} msg    - The message string to include in the log entry.
     * @param {object} [data] - The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     *
     * @returns {undefined}
     */
    warn(msg, data) {
        this.augmentedLog('warn', msg, data);
    }

    /**
     * Logging function to write a error-level log entry as the last log entry.
     *
     * @param {string} msg    - The message string to include in the log entry.
     * @param {object} [data] - The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     *
     * @returns {undefined}
     */
    error(msg, data) {
        this.augmentedLog('error', msg, data);
    }

    /**
     * Logging function to write a fatal-level log entry as the last log entry.
     *
     * @param {string} msg    - The message string to include in the log entry.
     * @param {object} [data] - The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     *
     * @returns {undefined}
     */
    fatal(msg, data) {
        this.augmentedLog('fatal', msg, data);
    }
}

/**
 * WereLogs Request Logger. This class provides all information required
 * to bufferise and dump log entries whenever it is relevant depending on
 * the global log level; and is used to track the log events for one given
 * request.
 */
class RequestLogger {

    /**
     * Constructor of the WereLogs Request Logger.
     * This function takes a logger instance, a logging level, and a last
     * parameter corresponding to the request UID.
     *
     * @param { bunyan.Logger } logger - A bunyan logger instance by which all
     *                                   logging output will go through,
     *                                   provided by the Werelogs main Logger.
     * @param { string } logLevel      - The floor logging level. All logging
     *                                   requests equal or above this level
     *                                   will be immediately output. Others
     *                                   will get bufferised.
     * @param { string } dumpThreshold - The floor dumping level. The full
     *                                   logging history (conditionned by the
     *                                   logging level) is dumped whenever a
     *                                   log entry reaches this level. This
     *                                   helps understanding any kind of error
     *                                   happenning in the system, and have a
     *                                   track of a whole request, at the point
     *                                   where it fails. dumpThreshold should
     *                                   be equal or greater than logLevel
     *                                   (geater meaning on the more critical
     *                                   side of)
     * @param { string } endLevel      - The logging level to use for the
     *                                   special finish logging call 'end()'
     * @param {(string[] | string | undefined)} [uids] - An Unique ID in a
     *                                   String format or Unique ID List of the
     *                                   parent request IDs. Any String of the
     *                                   UID shall not contain any colon, due
     *                                   to the serialization format chosen for
     *                                   the UID List.
     *
     * @returns {undefined}
     */
    constructor(logger, logLevel, dumpThreshold, endLevel, uids) {
        let uidList = undefined;

        if (!LogLevel.shouldLog(dumpThreshold, logLevel)) {
            throw new Error('Logging Dump level should be equal or'
                            + ' higher than logging filter level.');
        }

        if (uids !== undefined && Array.isArray(uids)) {
            uidList = uids.map(uid => ensureUidValidity(uid));
            uidList.push(generateUid());
        } else if (uids !== undefined && typeof uids === 'string') {
            uidList = [ensureUidValidity(uids)];
        }
        this.uids = uidList || [generateUid()];

        this.entries = [];
        this.fields = {};
        this.logLevel = logLevel;
        this.dumpThreshold = dumpThreshold;
        this.endLevel = endLevel;
        this.endLogger = new EndLogger(this);
        this.sLogger = logger;

        this.startTime = process.hrtime();
        this.elapsedTime = null;
    }

    /**
     * This function returns a copy of the local uid list, in order for
     * requests to a sub-component to be sent with the parent request's UID
     * list.
     *
     * @note The call to the map function is to make sure we get a copy of the
     * array instead of a reference to it.
     *
     * @returns {string[]}  A copy of the internal array of UIDs. It shall
     *                      never be empty, null or undefined.
     */
    getUids() {
        return this.uids.map(uid => uid);
    }

    /**
     * This function returns a string data containing the serialized version of
     * the UID List contained by the RequestLogger. This is a facility provided
     * to allow transmitting the UID List through any text-based protocol or
     * file-format between two components of a distributed architecture, that
     * would use the UID namespacing to track a request.
     *
     * @returns {string}    The serialized data of the UID List contained by the
     *                      Request Logger.
     */
    getSerializedUids() {
        return serializeUids(this.uids);
    }

    /**
     * This function allows the user to add default fields to include into all
     * JSON log entries generated through this request logger. As this function
     * attempt not to modify the provided fields object, it copies the field
     * into a new object for safe keeping.
     *
     * @param {object} fields   The dictionnary of additional fields to include
     *                          by default for this instance of the
     *                          RequestLogger.
     *
     * @returns {object}        The previous set of default fields (can be
     *                          safely ignored).
     */
    addDefaultFields(fields) {
        const oldFields = this.fields;
        this.fields = objectCopy({}, this.fields, fields);
        return oldFields;
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
        return this.log('trace', msg, data);
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
        return this.log('debug', msg, data);
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
        return this.log('info', msg, data);
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
        return this.log('warn', msg, data);
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
        return this.log('error', msg, data);
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
        return this.log('fatal', msg, data);
    }

    /**
     * @version 1.1
     * @method RequestLogger#end
     *
     * @description
     * Function returning a wrapped RequestLogger to be used at the end of a
     * given request. It will automatically include an elapsed_ms data field
     * in the associated log entry.
     *
     * @returns {EndLogger} The wrapped RequestLogger fit to actually do the
     *                      last logging operation, whatever logging level it
     *                      will be.
     */
    /**
     * @deprecated since version 1.1
     *
     * @version 1.0
     * @method RequestLogger#end
     *
     * @description
     * Logging function to write the last log entry for the given RequestLogger
     *
     * @param {string} msg    - The message string to include in the log entry.
     * @param {object} [data] - The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     *
     * @returns {undefined}
     */
    end(msg, data) {
        if (msg === undefined && data === undefined) {
            return this.endLogger;
        }
        assert.strictEqual(this.elapsedTime, null, 'The "end()" logging method '
                           + 'should not be called more than once.');
        return this.log(this.endLevel, msg, data, true);
    }

    /**
     * @deprecated since version 1.1
     *
     * Logging function to finish an elapsed counter in error level
     *
     * @param {string} msg    - The message string to include in the log entry.
     * @param {object} [data] - The object providing additional JSON fields
     *                          for the log entry. This is how to provide
     *                          metadata for a specific log entry.
     *
     * @returns {undefined}
     */
    errorEnd(msg, data) {
        assert.strictEqual(this.elapsedTime, null, 'The "end()" logging method '
                           + 'should not be called more than once.');
        return this.log('error', msg, data, true);
    }

    /**
     * This function adds a Log Entry to the logger, and logs it if its level
     * is above the configured logging level. In case the entry's level reaches
     * the dump threshold level, every past entry is dumped before this one,
     * no matter what their log levels were and what is the configured log
     * level.
     * This function also takes care of properly passing the input parameters
     * to bunyan, to comply with its API as much as is reasonable.
     * In order to avoid dumping multiple times the same entries, whenever the
     * dump threshold is reached, this function will be flushing its past
     * history after the dump operation is done.
     *
     * If the upperlaying API happens to be misused, this function will log a
     * fatal message including the parameters to the logging system, for the
     * developer to find out what he did wrong.
     *
     * @private
     *
     * @param {string} level       - The log level of the log entry. It is
     *                               assumed that the level name has already
     *                               been checked and is valid.
     * @param {string} msg         - The message to be printed out in the logs
     * @param {object} [logFields] - The additional JSON fields to include for
     *                               this specific log entry.
     * @param {boolean} isEnd      - The flag to tell whether the log entry is
     *                               the 'end' log entry that must provide
     *                               additional fields or not (elapsedTime)
     *
     * @returns {undefined}
     */
    log(level, msg, logFields, isEnd) {
        if (logFields !== undefined && typeof logFields !== 'object') {
            this.log(
                'fatal',
                'Werelogs API was mis-used.'
                + ' This development error should be fixed ASAP.',
                {
                    callparams: [msg, logFields],
                });
            return;
        }
        const fields = objectCopy({}, this.fields, logFields || {});
        const endFlag = isEnd || false;

        /*
        * using Date.now() as it's faster than new Date(). logstash component
        * uses this field to generate ISO 8601 timestamp
        */
        if (fields.time === undefined) {
            fields.time = Date.now();
        }

        // eslint-disable-next-line camelcase
        fields.req_id = serializeUids(this.uids);
        if (endFlag) {
            this.elapsedTime = process.hrtime(this.startTime);
            // eslint-disable-next-line camelcase
            fields.elapsed_ms = this.elapsedTime[0] * 1000
                + this.elapsedTime[1] / 1000000;
        }
        const logEntry = {
            level,
            fields,
            msg,
        };
        this.entries.push(logEntry);

        if (LogLevel.shouldLog(level, this.dumpThreshold)) {
            this.entries.forEach(entry => {
                this.doLogIO(entry);
            });
            this.entries = [];
        } else if (LogLevel.shouldLog(level, this.logLevel)) {
            this.doLogIO(logEntry);
        }
    }

    /**
     * This function transmits a log entry to the configured bunyan logger
     * instance. This way, we can rely on bunyan for actual logging operations,
     * and logging multiplexing, instead of managing that ourselves.
     *
     * @private
     *
     * @param {object} logEntry         - The Logging entry to be passed to
     *                                  bunyan
     * @param {string} logEntry.msg     - The message to be logged
     * @param {object} logEntry.fields  - The data fields to associate to the
     *                                  log entry.
     *
     * @returns {undefined}
     */
    doLogIO(logEntry) {
        switch (logEntry.level) {
        case 'trace':
            this.sLogger.trace(logEntry.fields, logEntry.msg);
            break;
        case 'debug':
            this.sLogger.debug(logEntry.fields, logEntry.msg);
            break;
        case 'info':
            this.sLogger.info(logEntry.fields, logEntry.msg);
            break;
        case 'warn':
            this.sLogger.warn(logEntry.fields, logEntry.msg);
            break;
        case 'error':
            this.sLogger.error(logEntry.fields, logEntry.msg);
            break;
        case 'fatal':
            this.sLogger.fatal(logEntry.fields, logEntry.msg);
            break;
        default:
            throw new Error(`Unexpected log level: ${logEntry.level}`);
        }
    }
}

module.exports = RequestLogger;
