'use strict';

const assert = require('assert');
const Utils = require('../../lib/Utils.js');
const generateUid = Utils.generateUid;
const serializeUids = Utils.serializeUids;
const unserializeUids = Utils.unserializeUids;
const copyFields = Utils.copyFields;

describe('Utils: generateUid', () => {
    it('generates a string-typed ID', (done) => {
        const uid = generateUid();
        assert.strictEqual(typeof(uid), 'string', 'The generated ID is not a String (' + typeof(uid) + ')');
        done();
    });
    it('generate roughly unique IDs', (done) => {
        const generated = {};
        let count = 0;
        for (let i = 0; i < 10000; ++i) {
            const uid = generateUid();
            count = generated[uid] ? generated[uid] + 1 : 1;
            generated[uid] = count;
        }
        Object.keys(generated).every((uid) => {
            assert.strictEqual(generated[uid], 1, `Uid ${uid} was generated ${generated[uid]} times: It is not even remotely unique.`);
        });
        done();
    });
});

describe('Utils: serializeUids', () => {
    it('serializes to the expected string data', (done) => {
        const uidList = [ 'FirstUID', 'SecondUID', 'ThirdUID'];
        const serializedUIDs = serializeUids(uidList);
        assert.strictEqual(serializedUIDs, 'FirstUID:SecondUID:ThirdUID', 'Serialized UID List should match expected value.');
        done();
    });

    it('unserializes the expected number of UIDs', (done) => {
        const refUidList = [ 'FirstUID', 'SecondUID', 'ThirdUID'];
        const unserializedUIDs = unserializeUids('FirstUID:SecondUID:ThirdUID');
        assert.deepStrictEqual(unserializedUIDs, refUidList, 'Unserialized UID List should match expected value.');
        done();
    });
});

describe('Utils: copyFields', () => {
    it('copies all the properties from source to target object', (done) => {
        const target = new Map();
        target.set('foo', 'bar');
        const source = { id: 1, name: 'demo', value: { a: 1, b: 2, c: 3 } };
        const result = new Map();
        result.set('foo', 'bar');
        result.set('id', 1);
        result.set('name', 'demo');
        result.set('value', { a: 1, b: 2, c: 3 });
        copyFields(target, source);
        assert.deepStrictEqual(target, result, 'target should have the same properties as source');
        done();
    });
});
