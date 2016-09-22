# WereLogs

[![CircleCI][badgepub]](https://circleci.com/gh/scality/werelogs)
[![Scality CI][badgepriv]](http://ci.ironmann.io/gh/scality/werelogs)

This repository provides a NodeJS Library that aims to be an efficient logging
library, reducing as much as possible the need to compute anything in NodeJS,
and focusing on a simple I/O scheme. The goal here is to make the most of
NodeJS's strengths, but relying on its I/O capacities, and avoiding any form of
computation that is known to not be advantageous in Node.

## Contributing

In order to contribute, please follow the
[Contributing Guidelines](
https://github.com/scality/Guidelines/blob/master/CONTRIBUTING.md).

## Installing the Library

In order to install WereLogs, you can use NPM with github's HTTP url, and save
it in your own package.json:

```
$> npm i --save scality/werelogs
```

As the repository is currently private, you will need to provide your username
and your password, or use the git+ssh protocol with a properly configured
environment, or use the git+https protocol with your username and cleartext
password in the URL (which I absolutely don't recommend for security reasons).

## Using the Library

Werelogs is a logging library that provides both per-request and per-module
logging facilities, through the intermediary of the per-module Logger that
is the default export.

Werelogs may be configured only once throughout your application's lifetime,
through the configuration options available in the per-module logger
constructor.

The per-module Logger object is used to log relevant events for a given module.

The RequestLogger object is the one you want to use for any logging operation
related to an ongoing request, so you will have to pass it to any function that
requires it.

All logging methods (trace, debug, info, warn, error and fatal) follow the same
prototype and usage pattern. They can take up to two parameters, the first one,
mandatory, being a string message, and the second one, optional, being an
object used to provide additional information to be included in the log entry.

The RequestLogger also provides a way to include some attributes in the JSON by
default for all subsequent logging calls, by explicitly inputting them only
once for the whole request's lifetime through the method
`addDefaultFields`.

As the RequestLogger is a logger strongly associated to a request's processing
operations, it provides a builtin facility to log the elapsed time in ms of the
said processing of the request. This is done through a specific logging method,
`end` that returns a prepared logging object. Using this returned object with
the usual logging methods will automatically compute the elapsed time from the
instantiation of the RequestLogger to the moment it is called, by using an
internal hi-res time generated at the instantiation of the logger.

```javascript
import Logger from 'werelogs';

/*
 * Here, configure your WereLogs Logger at a global level
 * It can be instantiated with a Name (for the module), and a config options
 * Object.
 *
 * This config options object contains a log level called 'level', a log
 * dumping threshold called 'dump'. The only unnecessary
 * field is the 'level' of each individual stream, as werelogs is managing
 * that on its own.
 *
 * All request loggers instantiated through this Logger will inherit its
 * configuration.
 */
const log = new Logger(
    'SampleModule',
    {
        level: 'debug',
        dump: 'error',
    }
);

/*
 * First, you can use the Logger as a module-level logger, logging events
 * that happen at the module's level.
 *
 * The API of the module-level logger is the same as the API of the request
 * Logger.
 */
log.info('Application started.');
log.warn('Starting RequestLogging...', {'metadata': new Date()});

doSomething(reqLogger) {
    /*
     * Let's add some kind of client-related data as default attributes first
     */
    reqLogger.addDefaultFields({ clientIP: '127.0.0.1',
                                 clientPort: '65535',
                                 clientName: 'Todd'});

    /*
     * Then, you can log some data, either a string or an object, using one of
     * the logging methods: 'trace', 'debug', 'info', 'warn', 'error', or
     * 'fatal'.
     */
    reqLogger.info('This is a string log entry');
    // This example provides additional information to include into the JSON
    reqLogger.info('Placing bet...',
                   { date: new Date().toISOString(),
                     odds: [1, 1000],
                     amount: 20000,
    });
}

function processRequest() {
    /*
     * Now, for one specific request, we need to get a request-specific logger
     * instance. It can be called without a request ID, and will then generate
     * one for you. Otherwise you can give it a string id (no specific format
     * required) or a list of string ids (that can allow request-scoping on a
     * distributed system)
     */
    const reqLogger = log.newRequestLogger();

    /* you need to provide your logger instance to the code that requires it,
     * as it is not a module-wide object instance */
    doSomething(reqLogger, ...);

    ...

    /*
     * Planning for some specific data to be included in the last logging
     * request, you could use the addDefaultFields of the end()'s object:
     */
    reqLogger.end().addDefaultFields({method: 'GET', client: client.getIP()})

    /*
     * This call will generate a log entry with an added elapsed_ms
     * field. This object can only be used once, as it should only be used for
     * the last log entry associated to this specific RequestLogger.
     * This call will be reusing potential data fields previously added through
     * end().addDefaultFields().
     */
    reqLogger.end().info('End of request.', { status: 200 });
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

[badgepub]: https://circleci.com/gh/scality/werelogs.svg?style=svg
[badgepriv]: http://ci.ironmann.io/gh/scality/werelogs.svg?style=svg&circle-token=a946e81ad65b99814403b5e57f017d9ecbe93f0a
