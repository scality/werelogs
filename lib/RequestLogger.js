import * as LogLevel from './LogLevel.js';
import { generateUid, serializeUids } from './Utils.js';

function ensureUidValidity(uid) {
    if (uid.indexOf(':') !== -1) {
        throw new Error(`RequestLogger UID "${uid}" contains an illegal character: ':'.`);
    }
    return uid;
}

function copyFields(src, dst) {
    const keys = Object.keys(src);
    if (keys && keys.length) {
        keys.forEach(k => dst[k] = src[k]);
    }
}

/**
 * WereLogs Request Logger. This class provides all information required
 * to bufferise and dump log entries whenever it is relevant depending on
 * the global log level; and is used to track the log events for one given
 * request.
 */
export default class RequestLogger {

    /**
     * Constructor of the WereLogs Request Logger.
     * This function takes a logger instance, a logging level, and a last
     * parameter corresponding to the request UID.
     *
     * @param logger { bunyan.Logger }  A bunyan logger instance by which all
     *                                  logging output will go through,
     *                                  provided by the Werelogs main Logger.
     * @param loglevel { string }       The floor logging level. All logging
     *                                  requests equal or above this level will
     *                                  be immediately output. Others will get
     *                                  bufferised.
     * @param dumpThreshold { string }  The floor dumping level. The full
     *                                  logging history (conditionned by the
     *                                  logging level) is dumped whenever a log
     *                                  entry reaches this level. This helps
     *                                  understanding any kind of error
     *                                  happenning in the system, and have a
     *                                  track of a whole request, at the point
     *                                  where it fails. dumpThreshold should be
     *                                  equal or greater than logLevel (geater
     *                                  meaning on the more critical side of)
     * @param uids { string[] | string | undefined } An Unique Id in a String
     *                                  format or Unique ID List of the parent
     *                                  request IDs. Any String of the UID shall
     *                                  not contain any colon, due to the
     *                                  serialization format chosen for the UID
     *                                  List.
     */
    constructor(logger, logLevel, dumpThreshold, uids = undefined) {
        let uidList = undefined;

        if (!LogLevel.shouldLog(dumpThreshold, logLevel)) {
            throw new Error('Logging Dump level should be equal or'
                            + ' higher than logging filter level.');
        }

        if (Array.isArray(uids)) {
            uidList = uids.map(uid => ensureUidValidity(uid));
            uidList.push(generateUid());
        } else if (typeof(uids) === 'string') {
            uidList = [ ensureUidValidity(uids) ];
        }
        this.uids = uidList || [ generateUid() ];

        this.entries = [];
        this.fields = {};
        this.logLevel = logLevel;
        this.dumpThreshold = dumpThreshold;
        this.bLogger = logger;
    }

    /**
     * This function returns a copy of the local uid list, in order for
     * requests to a sub-component to be sent with the parent request's UID
     * list.
     *
     * @note The call to the map function is to make sure we get a copy of the
     * array instead of a reference to it.
     *
     * @returns A copy of the internal array of UIDs. It shall never be empty,
     * null or undefined.
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
     * @returns {string} The serialized data of the UID List contained by the
     * Request Logger.
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
     * @params fields {Object} The dictionnary of additional fields to include
     * by default for the specific request.
     *
     * @returns the previous set of default fields (can be safely ignored).
     */
    addDefaultFields(fields) {
        const newFields = {};
        const oldFields = this.fields;

        copyFields(this.fields, newFields);
        copyFields(fields, newFields);

        this.fields = newFields;

        return oldFields;
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
        return this.log('trace', msg, data);
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
        return this.log('debug', msg, data);
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
        return this.log('info', msg, data);
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
        return this.log('warn', msg, data);
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
        return this.log('error', msg, data);
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
        return this.log('fatal', msg, data);
    }

    /**
     * This function adds a Log Entry to the logger, and logs it if its level
     * is above the configured logging level. In case the entry's level reaches
     * the dump threshold level, every past entry is dumped before this one,
     * no matter what their log levels were and what is the configured log
     * level.
     * This function also takes care of properly passing the input parameters
     * to bunyan, to try and interfere with bunyan's behavior as little as
     * possible (Only the first-param-as-Error is a bit of a special case).
     *
     * In order to avoid dumping multiple times the same entries, whenever the
     * dump threshold is reached, this function will be flushing its past
     * history after the dump operation is done.
     *
     * @method
     * @name log
     *
     * @params {string} level       The log level of the log entry. It is
     *                              assumed that the level name has already
     *                              been checked and is valid.
     * @params {string} msg         The message to be printed out in the logs
     * @params {Object} logFields   The additional JSON fields to include for
     *                              this specific log entry.
     */
    log(level, msg, logFields) {
        const fields = logFields || {};

        /*
         * Here, Stringify hrtime for it to stay within a one-liner when piping
         * the output through bunyan's cli tool.
         * Then prepend the fields to the argument Array we're preparing for
         * bunyan
         */
        fields.hrtime = JSON.stringify(process.hrtime());
        fields.req_id = serializeUids(this.uids);
        const logEntry = {
            level,
            fields,
            msg,
        };
        this.entries.push(logEntry);

        if (LogLevel.shouldLog(level, this.dumpThreshold)) {
            this.entries.forEach((entry) => {
                this.doLogIO(entry);
            });
            this.entries = [];
        } else if (LogLevel.shouldLog(level, this.logLevel)) {
            this.doLogIO(logEntry);
        }
    }

    doLogIO(logEntry) {
        const fields = {};
        copyFields(this.fields, fields);
        copyFields(logEntry.fields, fields);

        switch (logEntry.level) {
        case 'trace':
            this.bLogger.trace(fields, logEntry.msg);
            break;
        case 'debug':
            this.bLogger.debug(fields, logEntry.msg);
            break;
        case 'info':
            this.bLogger.info(fields, logEntry.msg);
            break;
        case 'warn':
            this.bLogger.warn(fields, logEntry.msg);
            break;
        case 'error':
            this.bLogger.error(fields, logEntry.msg);
            break;
        case 'fatal':
            this.bLogger.fatal(fields, logEntry.msg);
            break;
        default:
            throw new Error(`Unexpected log level: ${logEntry.level}`);
        }
    }
}
