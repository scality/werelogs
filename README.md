# WereLogs

This repository provides a NodeJS Library that aims to be an efficient logging
library, reducing as much as possible the need to compute anything in NodeJS,
and focusing on a simple I/O scheme. The goal here is to make the most of
NodeJS's strengths, but relying on its I/O capacities, and avoiding any form of
computation that is known to not be advantageous in Node.

## Installing the Library

In order to install WereLogs, you can use NPM with github's HTTP url, and save
it in your own package.json:
```
$> npm i --save scality/werelogs
```

As the repository is currently private, you will need to provide your username
and your password, or use the git+ssh protocol with a properly configured
environment, or use the git+https protocol with your username and cleartext
password in the URL (which I absolutely don't recomment for security reasons).

## Using the Library

As WereLogs is a per-request logging library and not a per-module one,
importing the library is not enough by itself (the module itself does not
provide logging methods). The module provides a method to instanciate a
request-specific logger object. That object is the one you want to use for any
logging operation related to your request, so you will have to pass it to
any function that requires it.

```es6
import Logger from 'werelogs';

/*
 * Here, configure your WereLogs Logger at a global level
 * It can be instanciated with a Name (for the module), and a config options
 * Object.
 *
 * This config options object contains a log level called 'level', a log
 * dumping threshold called 'dump', and an array of stream called 'streams'.
 * The 'streams' option shall follow bunyan's configuration needs, as werelogs
 * acts almost as a passthrough for this specific option. The only unnecessary
 * field is the 'level' of each individual stream, as werelogs is managning
 * that on its own. For the reference about how to configure bunyan's streams,
 * please refer to its repository's readme:
 * https://github.com/trentm/node-bunyan
 *
 * All request loggers instanciated through this Logger will inherit its
 * configuration.
 */
const logging = new Logger(
    'SampleModule',
    {
        level: 'debug',
        dump: 'error',
        streams: [
            // A simple, usual logging stream
            { stream: process.stdout},
            // A more complex logging stream provided by a bunyan plugin
            // that will upload the logs directly to an ELK's logstash service
            {
                type: 'raw',
                stream: require('bunyan-logstash').createStream({
                    host: '127.0.0.1',
                    port: 5505,
                }),
            }
        ],
    }
);

doSomething(reqLogger) {
    /*
     * Then, you can log some data, either a string or an object, using one of
     * the logging methods: 'trace', 'debug', 'info', 'warn', 'error', or
     * 'fatal'.
     */
    reqLogger.info('This is a string log entry');
    reqLogger.info('This is a template string log entry with an included date:'
                   + ` ${new Date().toISOString()}`);
    reqLogger.info({ status: 200, hasStuff: false });
}

function processRequest() {
    /*
     * Now, for one specific request, we need to get a request-specific logger
     * instance. It can be called without a request ID, and will then generate
     * one for you. Otherwise you can give it a string id (no specific format
     * required) or a list of string ids (that can allow request-scoping on a
     * distributed system)
     */
    const reqLogger = logging.newRequestLogger();

    /* you need to provide your logger instance to the code that requires it, as
     * it is not a module-wide object instance */
    doSomething(reqLogger, ...);

    ...
}
```

## Known Issues

In order to find out the known issues, it is advised to take a look at the
[project's github page](http://github.com/scality/werelogs). There, you should
be able to find the issues, tagged with the releases they are impacting,
whether they're open or closed.

## Contributing

The contributing rules for this project are defined in the associated
CONTRIBUTING.md file.
