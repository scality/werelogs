'use strict'; // eslint-disable-line strict

const os = require('os');
const safeJSONStringify = require('safe-json-stringify');
/*
* This function safely stringifies JSON. If an exception occcurs (due to
* circular references, exceptions thrown from object getters etc.), the module
* safe-json-stringify is used to remove the offending property and return a
* stringified object. This approach is ideal as it does not tax every log entry
* to use the module and has been tested using Cosbench to verify that it doesn't
* introduce any regression in performance.
*/
function safeStringify(obj) {
    let str;
    try {
        str = JSON.stringify(obj);
    } catch (e) {
        // fallback to remove circular object references or other exceptions
        // eslint-disable-next-line no-param-reassign
        obj.unsafeJSON = true;
        return safeJSONStringify(obj);
    }
    return str;
}

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
        this.streams = [{ level: 'trace', stream: process.stdout }];
        if (streams) {
            if (!Array.isArray(streams)) {
                throw new Error('Invalid streams. streams must be an array' +
                                ' list of writeable streams');
            }
            /*
            * This is for backwards compatibility. current config in projects
            * create a bunyan-logstash stream which is not a compatible
            * writeable stream. Any non-writable streams will be ignored.
            * This will be changed to throw an error if non-writable stream is
            * encountered.
            */
            this.streams = streams.filter(isWriteableStream);
        }
        this.hostname = os.hostname();
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
        logFields.hostname = this.hostname;
        logFields.pid = process.pid;

        this.streams.forEach(s => s.stream
            .write(`${safeStringify(logFields)}\n`));
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
