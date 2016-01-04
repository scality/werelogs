import * as LogLevel from './LogLevel.js';
import { generateUid } from './Utils.js';

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
     *                                  request IDs.
     */
    constructor(logger, logLevel, dumpThreshold, uids = undefined) {
        let uidList = undefined;

        if (!LogLevel.shouldLog(dumpThreshold, logLevel)) {
            throw new Error('Logging Dump level should be equal or'
                            + ' higher than logging filter level.');
        }

        if (Array.isArray(uids)) {
            uidList = uids.map(uid => uid);
            uidList.push(generateUid());
        } else if (typeof(uids) === 'string') {
            uidList = [ uids ];
        }
        this.uids = uidList || [ generateUid() ];

        this.entries = [];
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

    trace(message) {
        return this.log('trace', message);
    }

    debug(message) {
        return this.log('debug', message);
    }

    info(message) {
        return this.log('info', message);
    }

    warn(message) {
        return this.log('warn', message);
    }

    error(message) {
        return this.log('error', message);
    }

    fatal(message) {
        return this.log('fatal', message);
    }

    /**
     * This function adds a Log Entry to the logger, and logs it if its level
     * is above the configured logging level. In case the entry's level reaches
     * the dump threshold level, every past entry is dumped before this one,
     * no matter what their log levels were and what is the configured log
     * level.
     *
     * @method
     * @name log
     *
     * @param level {string}        The log level of the log entry. It is
     *                              assumed that the level name has already
     *                              been checked and is valid.
     * @param message {string}  The arguments sent to the function calling this
     *                          utility one.
     */
    log(level, msg) {
        const logEntry = {
            level,
            msg,
            hrtime: process.hrtime(),
            req_id: this.uids.join('-'),
        };
        this.entries.push(logEntry);

        if (LogLevel.shouldLog(level, this.dumpThreshold)) {
            this.entries.forEach((entry) => {
                this.doLogIO(entry);
            });
        } else if (LogLevel.shouldLog(level, this.logLevel)) {
            this.doLogIO(logEntry);
        }
    }

    doLogIO(logEntry) {
        switch (logEntry.level) {
        case 'trace':
            this.bLogger.trace({ hrtime: logEntry.hrtime,
                                 req_id: logEntry.req_id }, logEntry.msg);
            break;
        case 'debug':
            this.bLogger.debug({ hrtime: logEntry.hrtime,
                                 req_id: logEntry.req_id }, logEntry.msg);
            break;
        case 'info':
            this.bLogger.info({ hrtime: logEntry.hrtime,
                                req_id: logEntry.req_id }, logEntry.msg);
            break;
        case 'warn':
            this.bLogger.warn({ hrtime: logEntry.hrtime,
                                req_id: logEntry.req_id }, logEntry.msg);
            break;
        case 'error':
            this.bLogger.error({ hrtime: logEntry.hrtime,
                                 req_id: logEntry.req_id }, logEntry.msg);
            break;
        case 'fatal':
            this.bLogger.fatal({ hrtime: logEntry.hrtime,
                                 req_id: logEntry.req_id }, logEntry.msg);
            break;
        default:
            throw new Error(`Unexpected log level: ${logEntry.level}`);
        }
    }
}
