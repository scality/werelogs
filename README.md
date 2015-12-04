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
$> npm install --save https://github.com/scality/werelogs
```

As the repository is currently private, you will need to provide your username
and your password, or use the git+ssh protocol with a properly configured
environment.

## Using the Library

As WereLogs is a per-request logging library and not a per-module one,
importing the library is not enough by itself (the module itself does not
provide logging methods). The module provides a method to instanciate a
request-specific logger object. That object is the one you want to use for any
logging operation related to your request, so you will have to pass it to
any function that requires it.

```es6
import Logger from 'WereLogs';

/*
 * Here, configure your WereLogs Logger at a global level
 * It can be instanciated with a Name (for the module), a log level, and a log
 * dumping threshold. All request loggers instanciated through this Logger will
 * inherit its configuration.
 */
const logging = new Logger('SampleModule', 'debug', 'error');

function processRequest() {
    /*
     * Now, for one specific request, we need to get a request-specific logger
     * instance. It can be called without a request ID, and will then generate
     * one for you. Otherwise you can give it a string id (no specific format
     * required) or a list of string ids (that can allow request-scoping on a
     * distributed system)
     */
    const reqLogger = logging.newRequestLogger();

    /* you need to give your logger instance to the code that requires it, as
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

TBD
