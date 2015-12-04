import bunyan from 'bunyan';

import * as LogLevel from './LogLevel.js';
import RequestLogger from './RequestLogger.js';

export default class Logger {

    constructor(name, logLevel = 'info', dumpThreshold = 'error') {
        LogLevel.throwIfInvalid(logLevel);
        LogLevel.throwIfInvalid(dumpThreshold);
        this.logLevel = logLevel;
        this.dumpThreshold = dumpThreshold;
        this.bLogger = bunyan.createLogger({
            name,
            stream: {
                level: 'debug',
                stream: process.stdout,
            },
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

    newRequestLogger(uids) {
        return new RequestLogger(this.bLogger, this.logLevel, this.dumpThreshold, uids);
    }
}
