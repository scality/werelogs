'use strict';
const os = require('os');

function isWriteableStream(s) {
    if (!s.stream) {
        return false;
    }
    // duck typing to check if the obect is a writeable stream
    return s.stream.writable;
}

class SimpleLogger {
    constructor(name, streams) {
        this.name = name;
        this.streams = [ { level: 'info', stream: process.stdout } ];
        if (streams) {
            if (!Array.isArray(streams)) {
                throw new Error('Invalid streams. streams must be an array list' +
                ' of writeable streams');
            }
            /*
            * This is for backwards compatibility. current config in projects
            * create a bunyan-logstash stream which is not a compatible
            * writeable stream. Any non-writable streams will be ignored.
            */
            this.streams = streams.filter(isWriteableStream);
        }
    }

    log(level, fields, message) {
        let logFields;
        let logMsg;
        if (message === undefined && typeof fields === 'string') {
            logMsg = fields;
            logFields = {};
        } else {
            logMsg = message;
            logFields = fields || {};
        }
        // TODO - Protect these fields from being overwritten
        logFields.level = level;
        logFields.message = logMsg;
        logFields.hostname = os.hostname();
        logFields.pid = process.pid;
        const logEntry = JSON.stringify(logFields) + '\n';
        this.streams.forEach( s => s.stream.write(logEntry));
    }

    info(fields, message) {
        this.log('info', fields, message);
    }

    debug(fields, message) {
        this.log('debug', fields, message);
    }

    trace(fields, message) {
        this.log('trace', fields, message);
    }

    warn(fields, message) {
        this.log('warn', fields, message);
    }

    error(fields, message) {
        this.log('error', fields, message);
    }

    fatal(fields, message) {
        this.log('fatal', fields, message);
    }
}

module.exports = SimpleLogger;
