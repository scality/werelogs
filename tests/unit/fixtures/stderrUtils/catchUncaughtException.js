#!/usr/bin/env node
// Convert string args into primitive value
const fromStr = (str, primitive) => (str === `${primitive}` ? primitive : str);
const date = fromStr(process.argv[2], undefined);
const exitCode = fromStr(fromStr(process.argv[3], null), undefined);
const promise = fromStr(process.argv[4], true);

const { stderrUtils } = require('../../../../index');

stderrUtils.catchAndTimestampUncaughtException(
    date ? () => date : undefined,
    exitCode,
);

// Executed if process does not exit, process is in undefined behavior (bad)
// eslint-disable-next-line no-console
setTimeout(() => console.log('EXECUTED AFTER UNCAUGHT EXCEPTION'), 1);

if (promise === true) {
    Promise.reject();
} else {
    throw new Error('TestingError');
}
