'use strict'; // eslint-disable-line strict

const Config = require('./Config.js');
const Logger = require('./Logger.js');

class API {

    /**
     * This is the constructor of the Logger class. It takes optional
     * configuration parameters, that allow to modify its behavior.
     *
     * @param {object} config         - A configuration object for werelogs.
     * @param {string} config.level   - The name of the logging level ('trace',
     *                                  'debug', 'info', 'warn', 'error' and
     *                                  'fatal' in order of importance.)
     * @param {string} config.dump    - The name of the log dumping level
     *                                  ('trace', 'debug', 'info', 'warn',
     *                                  'error' and 'fatal' in order of
     *                                  importance.)
     * @param {object[]} config.streams - The streams into which to log. This
     *                                    is an Array of objects which have a
     *                                    field named 'stream', which is
     *                                    writeable.
     */
    constructor(config) {
        this.config = new Config(config);
        this.preboundLogger = Logger.bind(null, this.config);
    }

    /**
     * This is a thunk function that allows reconfiguring the streams and log
     * levels of all Logger and future RequestLogger objects. Note that
     * existing RequestLogger will live their lifespan retaining the old
     * configuration.
     * If the provided configuration is erroneous, the function may throw
     * exceptions depending on the detected configuration error. Please see the
     * Config class's documentation about that.
     *
     * @throws {TypeError}  - One of the provided arguments is not of the
     *                        expected type
     * @throws {RangeError} - The logging level provided is not part of the
     *                        supported logging levels
     * @throws {Error}      - A human-readable message providing details about
     *                        a logic error due to the input parameters
     *                        provided.
     *
     * @param {object} config         - A configuration object for werelogs.
     * @param {string} config.level   - The name of the logging level ('trace',
     *                                  'debug', 'info', 'warn', 'error' and
     *                                  'fatal' in order of importance.)
     * @param {string} config.dump    - The name of the log dumping level
     *                                  ('trace', 'debug', 'info', 'warn',
     *                                  'error' and 'fatal' in order of
     *                                  importance.)
     * @param {object[]} config.streams - The streams into which to log. This
     *                                    is an Array of objects which have a
     *                                    field named 'stream', which is
     *                                    writeable.
     *
     * @returns {undefined}
     *
     */
    reconfigure(config) {
        this.config.update(config);
    }

    get Logger() {
        return this.preboundLogger;
    }
}

module.exports = API;
