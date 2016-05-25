'use strict';

const Utils = require('./Utils.js');
const objectCopy = Utils.objectCopy;

function isWriteableStream(s) {
    if (!s || !s.level || !s.stream) {
        return false;
    }
    // duck typing to check if the obect is a writeable stream
    if (typeof s.stream._write !== 'function') {
        return false;
    }
    return true;
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

            if (!streams.every(isWriteableStream)) {
                throw new Error('Stream supplied is not a Writeable stream');
            }
            this.streams = streams;
        }
    }

    log(level, fields, message) {
        this.streams.forEach( s => {
            s.stream.write(JSON.stringify(
                objectCopy({}, { level }, fields, { message } )) + '\n'
            );
        });
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
