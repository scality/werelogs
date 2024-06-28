#!/usr/bin/env node
// Convert string args into primitive value
const fromStr = (str, primitive) => (str === `${primitive}` ? primitive : str);
const date = fromStr(process.argv[2], undefined);
const name = fromStr(process.argv[3], undefined);
const code = fromStr(process.argv[4], undefined);
const detail = fromStr(process.argv[5], undefined);

const { stderrUtils } = require('../../../../index');

stderrUtils.catchAndTimestampWarning(
    date ? () => date : undefined,
);

const warning = new Error('TestWarningMessage');

if (name) warning.name = name;
if (code) warning.code = code;
if (detail) warning.detail = detail;

process.emitWarning(warning);

/*
Examples:

(node:203831) Error: TestWarningMessage
    at Object.<anonymous> (catchWarning.js:15:17)
    ...
    at node:internal/main/run_main_module:22:47
Above Warning Date: 2024-06-26T16:32:55.505Z

(node:205151) [TEST01] CUSTOM: TestWarningMessage
    at Object.<anonymous> (catchWarning.js:15:17)
    ...
    at node:internal/main/run_main_module:22:47
Some additional detail
Above Warning Date: Tue, 31 Dec 2024 10:20:30 GMT
*/
