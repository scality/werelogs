'use strict'; // eslint-disable-line strict

const Config = require('./Config.js');

class API {

    /**
     * This is the constructor of the Logger class. It takes optional
     * configuration parameters, that allow to modify its behavior.
     *
     * @param {object} config         - A configuration object for werelogs.
     * @param {string} config.level   - The string name of the logging level
     *                                  ('trace', 'debug', 'info', 'warn',
     *                                  'error' and 'fatal' in order of
     *                                  importance.)
     * @param {string} config.dump    - The string name of the log dumping level
     *                                  ('trace', 'debug', 'info', 'warn',
     *                                  'error' and 'fatal' in order of
     *                                  importance.)
     * @param {object[]} config.streams   - The array of streams into which to
     *                                      log. Their configuration is directly
     *                                      related to the expected bunyan
     *                                      streams array, for compatibility
     *                                      purposes (except that the 'level'
     *                                      field is not accounted for)
     *
     * @see [Bunyan's documentation]{@link
     * https://github.com/trentm/node-bunyan/blob/master/README.md#streams} for
     * a more detailed description of the streams array configuration.
     *
     * @returns {undefined}
     */
    constructor(config) {
        this.config = new Config(config);
        this.Logger = Logger.bind(null, config);
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
     * @param {object} config             - A configuration object for werelogs.
     * @param {string} config.level       - The string name of the logging level
     *                                      ('trace', 'debug', 'info', 'warn',
     *                                      'error' and 'fatal' in order of
     *                                      importance.)
     * @param {string} config.dump        - The string name of the log dumping
     *                                      level ('trace', 'debug', 'info',
     *                                      'warn', 'error' and 'fatal' in
     *                                      order of importance.)
     * @param {object[]} config.streams   - The array of streams into which to
     *                                      log. Their configuration is directly
     *                                      related to the expected bunyan
     *                                      streams array, for compatibility
     *                                      purposes (except that the 'level'
     *                                      field is not accounted for)
     *
     * @see [Bunyan's documentation]{@link
     * https://github.com/trentm/node-bunyan/blob/master/README.md#streams} for
     * a more detailed description of the streams array configuration.
     *
     * @returns {undefined}
     *
     */
    reconfigure(config) {
        this.config.update(config);
    }
}

modules.export = API;
