import bunyan from 'bunyan';

import * as LogLevel from './LogLevel.js';
import RequestLogger from './RequestLogger.js';
import { unserializeUids } from './Utils.js';

export default class Logger {

    constructor(name, logLevel = 'info', dumpThreshold = 'error') {
        LogLevel.throwIfInvalid(logLevel);
        LogLevel.throwIfInvalid(dumpThreshold);
        this.logLevel = logLevel;
        this.dumpThreshold = dumpThreshold;
        this.bLogger = bunyan.createLogger({
            name,
            streams: [
                {
                    level: 'trace',
                    stream: process.stdout,
                },
            ],
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
}
