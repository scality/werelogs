#!/usr/bin/env node
// Convert string args into primitive value
const fromStr = (str, primitive) => (str === `${primitive}` ? primitive : str);
const date = fromStr(process.argv[2], undefined);
const exitCode = fromStr(fromStr(process.argv[3], null), undefined);

const { stderrUtils } = require('../../../../index');

stderrUtils.catchAndTimestampStderr(
    date ? () => date : undefined,
    exitCode,
);

process.emitWarning('TestWarningMessage');
// This will print warning after printing error before exit
throw new Error('TestingError');

