import assert from 'assert';

import { default as genericFilterGenerator, DummyLogger } from '../Utils.js';

import RequestLogger from '../../lib/RequestLogger.js';

/**
 * This function is a thunk-function calling the Utils'  filterGenerator with
 * the right createLogger function, while seemlessly passing through its
 * arguments.
 */
function filterGenerator(...params) {
    function createRequestLogger(dummyLogger, filterLevel) {
        return new RequestLogger(dummyLogger, filterLevel, 'fatal');
    }

    /*
     * Array-ify the arguments object, and append the specificly-added argument
     * to it.
     */
    const args = Array.prototype.splice.apply(params, [0]);
    args.push(createRequestLogger);

    return genericFilterGenerator.apply({}, args);
}


function runLoggingDumpTest(commandHistory, expectedHistory, expectedCounts, done) {
    const dummyLogger = new DummyLogger();
    const reqLogger = new RequestLogger(dummyLogger, 'trace', 'error');

    commandHistory.every(function doLogWithLevel(val, index) {
        switch (val) {
        case 'trace': reqLogger.trace(index); break;
        case 'debug': reqLogger.debug(index); break;
        case 'info': reqLogger.info(index);   break;
        case 'warn': reqLogger.warn(index);   break;
        case 'error': reqLogger.error(index); break;
        case 'fatal': reqLogger.fatal(index); break;
        default:
            done(new Error('Unexpected logging level name: ', val));
        }
        return true;
    });

    expectedHistory.every((val, index) => {
        assert.strictEqual(dummyLogger.ops[index][0], val[0], 'Expected log entry levels to match.');
        assert.strictEqual(dummyLogger.ops[index][1][1][0], val[1], 'Expected log entry values to match.');
        return true;
    });
    assert.deepEqual(dummyLogger.counts, expectedCounts);
}


describe('RequestLogger', () => {
    describe('Object Instanciation', () => {
        describe('Logging Levels Initialization', () => {
            it('Throws if LogLevel is higher than dumpThreshold', (done) => {
                assert.throws(
                    () => {
                        return new RequestLogger(undefined, 'fatal', 'debug');
                    },
                    Error,
                    'Dump level "debug" should not be valid with logging level "fatal".');
                done();
            });

            it('Works with LogLevel lesser or equal to DumpLevel', (done) => {
                assert.doesNotThrow(
                    () => {
                        return new RequestLogger(undefined, 'debug', 'fatal');
                    },
                    Error,
                    'Dump level "fatal" should be valid with logging level "debug".');
                done();
            });
        });

        describe('UID Initialization', () => {
            it('defines an UID when none provided', (done) => {
                const dummyLogger = new DummyLogger();
                const reqLogger = new RequestLogger(dummyLogger, 'debug', 'fatal');
                assert.strictEqual(Array.isArray(reqLogger.uids), true, 'Expected uid list to be an Array.');
                assert.strictEqual(reqLogger.uids.length, 1, 'Expected uid list to contain one element.');
                done();
            });

            it('creates an UID array out of the provided UID string', (done) => {
                const dummyLogger = new DummyLogger();
                const uids = 'BasicUid';
                const reqLogger = new RequestLogger(dummyLogger, 'debug', 'fatal', uids);
                assert.strictEqual(Array.isArray(reqLogger.uids), true, 'Expected uid list to be an Array.');
                assert.strictEqual(reqLogger.uids.length, 1, 'Expected uid list to contain one element.');
                assert.strictEqual(reqLogger.uids[0], uids, 'Expected uid list to only contain the value given as argument.');
                done();
            });

            it('throws when UID string provided contains a colon', (done) => {
                assert.throws(
                    () => {
                        return new RequestLogger(undefined, 'debug', 'fatal', 'pouet:tata');
                    },
                    Error,
                    'UID string "pouet:tata" should be rejected by the RequestLogger constructor.');
                done();
            });

            it('expands the UID array when one is provided', (done) => {
                const dummyLogger = new DummyLogger();
                const uids = ['oneuid', 'twouid', 'threeuids'];
                const reqLogger = new RequestLogger(dummyLogger, 'debug', 'fatal', uids);
                assert.strictEqual(Array.isArray(reqLogger.uids), true, 'Expected uid list to be an Array.');
                assert.strictEqual(reqLogger.uids.length, 4, 'Expected uid list to contain four elements.');
                assert.strictEqual(uids.indexOf(reqLogger.uids[3]), -1, 'Expected the last uid of the list to be the new one.');
                done();
            });

            it('throws when UID string Array provided contains an UID that contains a colon', (done) => {
                assert.throws(
                    () => {
                        return new RequestLogger(undefined, 'debug', 'fatal', ['OneUID', 'SecondUID', 'Test:DashUID']);
                    },
                    Error,
                    'UID string "Test:DashUID" should be rejected by the RequestLogger constructor.');
                done();
            });
        });

        describe('getUids() method', () => {
            it('retrieves a list of string UID', (done) => {
                const dummyLogger = new DummyLogger();
                const reqLogger = new RequestLogger(dummyLogger, 'info', 'error');
                const uidlist = reqLogger.getUids();
                assert.strictEqual(Array.isArray(uidlist), true, 'Expected UID List to be an Array');
                assert.strictEqual(typeof uidlist[0], 'string', 'Expected UID items to be strings');
                done();
            });

            describe('Length of the UIDs array', () => {
                it('default constructor yields a one-item UID list', (done) => {
                    const dummyLogger = new DummyLogger();
                    const reqLogger = new RequestLogger(dummyLogger, 'info', 'error');
                    const uidlist = reqLogger.getUids();
                    assert.strictEqual(uidlist.length, 1, 'Expected only one item in UID Array');
                    done();
                });

                it('manually-set UID constructor yields a one-item UID list', (done) => {
                    const dummyLogger = new DummyLogger();
                    const myUid = 'ThisIsMyUid';
                    const reqLogger = new RequestLogger(dummyLogger, 'info', 'error', myUid);
                    const uidlist = reqLogger.getUids();
                    assert.strictEqual(uidlist.length, 1, 'Expected only one item in UID Array');
                    assert.strictEqual(uidlist[0], myUid, 'Expected UID to match what was used to set it.');
                    done();
                });

                it('manually-set parent UID List constructor yields a n+1 item UID list', (done) => {
                    const dummyLogger = new DummyLogger();
                    const myParentUidList = [ 'ThisIsMyOriginUid', 'ThisIsMySecondGenUid', 'ThisIsMyThirdGenUid' ];
                    const reqLogger = new RequestLogger(dummyLogger, 'info', 'error', myParentUidList);
                    const uidlist = reqLogger.getUids();
                    assert.strictEqual(uidlist.length, myParentUidList.length + 1, 'Expected n+1 item in UID Array compared to set UID List array');
                    assert.deepStrictEqual(uidlist.slice(0, -1), myParentUidList, 'Expected UID list[:-1] to match what was used to set it.');
                    done();
                });
            });

            it('internal data cannot be set through returned UID List', (done) => {
                const dummyLogger = new DummyLogger();
                const reqLogger = new RequestLogger(dummyLogger, 'info', 'error');
                const uidlist = reqLogger.getUids();
                uidlist.push('Test');
                assert.notStrictEqual(uidlist.length, reqLogger.getUids().length, 'Expected different number of items in internals and local variable.');
                done();
            });
        });

        describe('getSerializedUids()', () => {
            it('Should return a properly serialized UID Array', (done) => {
                const dummyLogger = new DummyLogger();
                const uidList = [ 'FirstUID', 'SecondUID', 'ThirdUID', 'TestUID' ];
                const reqLogger = new RequestLogger(dummyLogger, 'info', 'error', uidList);
                const expectedString = 'FirstUID:SecondUID:ThirdUID:TestUID:' + reqLogger.getUids()[4];
                assert.strictEqual(reqLogger.getSerializedUids(), expectedString, 'Expected serialized UID List to match expected data.');
                done();
            });
        });
    });

    describe('Logging level dump filtering', () => {
        it('Trace level does not filter trace level out',   filterGenerator('trace', 'trace'));
        it('Trace level does not filter debug level out',   filterGenerator('trace', 'debug'));
        it('Trace level does not filter info level out',    filterGenerator('trace', 'info'));
        it('Trace level does not filter warn level out',    filterGenerator('trace', 'warn'));
        it('Trace level does not filter error level out',   filterGenerator('trace', 'error'));
        it('Trace level does not filter fatal level out',   filterGenerator('trace', 'fatal'));

        it('Debug level filters trace level out',           filterGenerator('debug', 'trace'));
        it('Debug level does not filter debug level out',   filterGenerator('debug', 'debug'));
        it('Debug level does not filter info level out',    filterGenerator('debug', 'info'));
        it('Debug level does not filter warn level out',    filterGenerator('debug', 'warn'));
        it('Debug level does not filter error level out',   filterGenerator('debug', 'error'));
        it('Debug level does not filter fatal level out',   filterGenerator('debug', 'fatal'));

        it('Info level filters trace level out',            filterGenerator('info', 'trace'));
        it('Info level filters debug level out',            filterGenerator('info', 'debug'));
        it('Info level does not filter info level out',     filterGenerator('info', 'info'));
        it('Info level does not filter warn level out',     filterGenerator('info', 'warn'));
        it('Info level does not filter error level out',    filterGenerator('info', 'error'));
        it('Info level does not filter fatal level out',    filterGenerator('info', 'fatal'));

        it('Warning level filters trace level out',         filterGenerator('warn', 'trace'));
        it('Warning level filters debug level out',         filterGenerator('warn', 'debug'));
        it('Warning level filters info level out',          filterGenerator('warn', 'info'));
        it('Warning level does not filter warn level out',  filterGenerator('warn', 'warn'));
        it('Warning level does not filter error level out', filterGenerator('warn', 'error'));
        it('Warning level does not filter fatal level out', filterGenerator('warn', 'fatal'));

        it('Error level filters trace level out',           filterGenerator('error', 'trace'));
        it('Error level filters debug level out',           filterGenerator('error', 'debug'));
        it('Error level filters info level out',            filterGenerator('error', 'info'));
        it('Error level filters warn level out',            filterGenerator('error', 'warn'));
        it('Error level does not filter error level out',   filterGenerator('error', 'error'));
        it('Error level does not filter fatal level out',   filterGenerator('error', 'fatal'));

        it('Fatal level filters trace level out',           filterGenerator('fatal', 'trace'));
        it('Fatal level filters debug level out',           filterGenerator('fatal', 'debug'));
        it('Fatal level filters info level out',            filterGenerator('fatal', 'info'));
        it('Fatal level filters warn level out',            filterGenerator('fatal', 'warn'));
        it('Fatal level filters error level out',           filterGenerator('fatal', 'error'));
        it('Fatal level does not filter fatal level out',   filterGenerator('fatal', 'fatal'));
    });

    describe('Default Fields', () => {
        it('should not modify the object passed as a parameter', (done) => {
            const add1 = {
                attr1: 0,
            };
            const add2 = {
                attr2: 'string',
            };
            const dummyLogger = new DummyLogger();
            const reqLogger = new RequestLogger(dummyLogger, 'info', 'fatal');
            reqLogger.addDefaultFields(add1);
            reqLogger.addDefaultFields(add2);
            assert.deepStrictEqual(add1, { attr1: 0 });
            assert.deepStrictEqual(add2, { attr2: 'string' });
            done();
        });

        it('should add one added default field to the log entries', (done) => {
            const clientInfo = {
                clientIP: '127.0.0.1',
            };
            const dummyLogger = new DummyLogger();
            const reqLogger = new RequestLogger(dummyLogger, 'info', 'fatal');
            reqLogger.addDefaultFields(clientInfo);
            reqLogger.info('test message');
            console.log(clientInfo);
            console.log(dummyLogger.ops[0][1][0]);
            assert.strictEqual(clientInfo.clientIP, dummyLogger.ops[0][1][0].clientIP);
            done();
        });

        it('should add multiple added default fields to the log entries', (done) => {
            const clientInfo = {
                clientIP: '127.0.0.1',
                clientPort: '1337',
            };
            const requestInfo = {
                object: '/tata/self.txt',
                creator: 'Joddy',
            };
            const dummyLogger = new DummyLogger();
            const reqLogger = new RequestLogger(dummyLogger, 'info', 'fatal');
            reqLogger.addDefaultFields(clientInfo);
            reqLogger.addDefaultFields(requestInfo);
            reqLogger.info('test message');
            assert.strictEqual(clientInfo.clientIP, dummyLogger.ops[0][1][0].clientIP);
            assert.strictEqual(clientInfo.clientPort, dummyLogger.ops[0][1][0].clientPort);
            assert.strictEqual(requestInfo.object, dummyLogger.ops[0][1][0].object);
            assert.strictEqual(requestInfo.creator, dummyLogger.ops[0][1][0].creator);
            done();
        });
    });

    describe('Log History dumped when logging floor level reached', () => {
        it('Dumping duplicates log entries', (done) => {
            const commandHistory = ['info', 'error'];
            const expectedHistory = [['info', 0], ['info', 0], ['error', 1]];
            const expectedCounts = { trace: 0, debug: 0, info: 2, warn: 0, error: 1, fatal: 0 };

            runLoggingDumpTest(commandHistory, expectedHistory, expectedCounts, done);
            done();
        });

        it('Dumping Keeps logging history order', (done) => {
            const commandHistory = ['trace', 'info', 'debug', 'error'];
            const expectedHistory = [['trace', 0], ['info', 1], ['debug', 2], ['trace', 0], ['info', 1], ['debug', 2], ['error', 3]];
            const expectedCounts = { trace: 2, debug: 2, info: 2, warn: 0, error: 1, fatal: 0 };

            runLoggingDumpTest(commandHistory, expectedHistory, expectedCounts, done);
            done();
        });

        it('Dumping multiple times does not re-dump already-dumped entries', (done) => {
            const commandHistory = ['trace', 'info', 'debug', 'error',
                                    'warn', 'debug', 'fatal'];
            const expectedHistory = [['trace', 0], ['info', 1], ['debug', 2],
                                     ['trace', 0], ['info', 1], ['debug', 2], ['error', 3],
                                     ['warn', 4], ['debug', 5],
                                     ['warn', 4], ['debug', 5], ['fatal', 6]];
            const expectedCounts = { trace: 2, debug: 4, info: 2, warn: 2, error: 1, fatal: 1 };

            runLoggingDumpTest(commandHistory, expectedHistory, expectedCounts, done);
            done();
        });
    });
});
