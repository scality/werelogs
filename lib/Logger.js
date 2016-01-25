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

    /**
     * Logging functions
     *
     * For the module-level logging,
     */
    _doLog(levelName, args) {
        if (!LogLevel.shouldLog(levelName, this.logLevel)) {
            return;
        }
        const logArgs = Array.prototype.splice.apply(args);
        this.bLogger[levelName].apply(this.bLogger, logArgs);
    }

    trace() {
        this._doLog('trace', arguments);
    }

    debug() {
        this._doLog('debug', arguments);
    }

    info() {
        this._doLog('info', arguments);
    }

    warn() {
        this._doLog('warn', arguments);
    }

    error() {
        this._doLog('error', arguments);
    }

    fatal() {
        this._doLog('fatal', arguments);
    }
}
