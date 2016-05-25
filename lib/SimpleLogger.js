'use strict';

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

            this.streams = streams.filter(isWriteableStream);
        }
    }

    log(level, fields, message) {
        for (let i = 0; i < this.streams.length; i++) {
            const s = this.streams[i];
            const logEntry = Object.create(null);
            logEntry.level = level;
            logEntry.message = message;
            if (fields instanceof Map) {
                fields.forEach((v, k) => { logEntry[k] = v; });
            }
            s.stream.write(JSON.stringify(logEntry) + '\n');
        }
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
