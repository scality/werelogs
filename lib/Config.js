'use strict'; // eslint-disable-line strict

const LogLevel = require('./LogLevel.js');
const SimpleLogger = require('./SimpleLogger.js');
/**
 * This class is the central point of the once-only configuration system for
 * werelogs. It is instanciated once to be exported, and all configuration
 * operations go through this object. This is the way we chose for the
 * configuration to be shared at a library-level, in order to set the
 * configuration only once as a user of werelogs.
 */
class Config {
    /**
     * This is the default constructor of the Config Object, and the only way
     * to instanciate it (with default parameters).
     *
     * @param {object} conf             - A configuration object for werelogs.
     * @param {string} conf.level       - The string name of the logging level
     *                                    ('trace', 'debug', 'info', 'warn',
     *                                    'error' and 'fatal' in order of
     *                                    importance.)
     * @param {string} conf.dump        - The string name of the log dumping
     *                                    level ('trace', 'debug', 'info',
     *                                    'warn', 'error' and 'fatal' in order
     *                                    of importance.)
     * @param {object[]} conf.streams   - The array of streams into which to
     *                                    log. This is an Array of objects
     *                                    which have a field named 'stream',
     *                                    which is writeable.
     *
     * @returns {undefined}
     */
    constructor(conf) {
        this.logLevel = 'info';
        this.dumpThreshold = 'error';
        this.endLevel = 'info';
        this.streams = [{ level: 'trace', stream: process.stdout }];
        this.simpleLogger = new SimpleLogger('werelogs', this.streams);
        if (conf) {
            this.update(conf);
        }
    }

    /**
     * This method resets the state of the Config Object, by setting only
     * default values inside.
     *
     * @returns {Config} - this
     */
    reset() {
        return this.update({
            level: 'info',
            dump: 'error',
            end: 'info',
            streams: [{ level: 'trace', stream: process.stdout }],
        });
    }

    /**
     * This is the central nervous system of this Configuration object.
     * It supports updating the current configuration, and will re-generate
     * a bunyan logger if the streams array changed.
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
     * @param {object[]} config.streams - The array of streams into which to
     *                                    log. This is an Array of objects
     *                                    which have a field named 'stream',
     *                                    which is writeable.
     *
     * @see [Bunyan's documentation]{@link
     * https://github.com/trentm/node-bunyan/blob/master/README.md#streams} for
     * a more detailed description of the streams array configuration.
     *
     * @returns {Config} - this
     */
    update(config) {
        if (!config) {
            return this;
        }

        const checkedConfig = config || {};

        if (checkedConfig.hasOwnProperty('level')) {
            LogLevel.throwIfInvalid(checkedConfig.level);
        }
        if (checkedConfig.hasOwnProperty('dump')) {
            LogLevel.throwIfInvalid(checkedConfig.dump);
        }
        // for check log level vs. log dump level
        const newLogLevel = checkedConfig.level || this.logLevel;
        const newLogDumpLevel = checkedConfig.dump || this.dumpThreshold;
        if (newLogDumpLevel &&
            !LogLevel.shouldLog(newLogDumpLevel, newLogLevel)) {
            throw new Error(
                'Logging level should be at most logging dump level');
        }

        if (checkedConfig.hasOwnProperty('level')) {
            this.logLevel = checkedConfig.level;
        }

        if (checkedConfig.hasOwnProperty('dump')) {
            this.dumpThreshold = checkedConfig.dump;
        }

        if (checkedConfig.hasOwnProperty('end')) {
            LogLevel.throwIfInvalid(checkedConfig.end);
            this.endLevel = checkedConfig.end;
        }

        if (checkedConfig.hasOwnProperty('streams')) {
            if (!Array.isArray(checkedConfig.streams)) {
                throw new TypeError('WereLogs config.streams must be an Array '
                                    + 'of Writeable Streams.');
            }
            if (!checkedConfig.streams.length) {
                throw new Error('Werelogs config.streams must contain at ' +
                                'least one stream.');
            }
            this.streams = checkedConfig.streams.map(stream => {
                stream.level = 'trace'; // eslint-disable-line no-param-reassign
                return stream;
            });

            this.simpleLogger = new SimpleLogger('werelogs', this.streams);
        }

        return this;
    }

    /**
     * This function is a simple getter to get access to the config's internal
     * bunyan Logger. By using this function instead of keeping a reference to
     * a bunyan Logger instance, we make it so that we can switch loggers
     * on-the-fly for the loggers that rely on this.
     *
     * @returns {Bunyan.Logger} - A Bunyan logger to be used for logging
     *                          operations by the user code.
     */
    get logger() {
        return this.simpleLogger;
    }

    /**
     * This function is a simple getter to get access to the config's internal
     * logging level. By using this function instead of keeping a reference to
     * it, we make it so that we can switch configuration on-the-fly for the
     * loggers that rely on this.
     *
     * @returns {string} - The configured logging level
     */
    get level() {
        return this.logLevel;
    }

    /**
     * This function is a simple getter to get access to the config's internal
     * dump Threshold. By using this function instead of keeping a reference to
     * it, we make it so that we can switch configuration on-the-fly for the
     * loggers that rely on this.
     *
     * @returns {string} - The configured dump threshold
     */
    get dump() {
        return this.dumpThreshold;
    }

    /**
     * This function is a simple getter to get access to the config's internal
     * end logging level. By using this function instead of keeping a reference
     * to it, we make it so that we can switch configuration on-the-fly for the
     * loggers that rely on this.
     *
     * @returns {string} - The configured 'end' logging level
     */
    get end() {
        return this.endLevel;
    }
}

module.exports = Config;
