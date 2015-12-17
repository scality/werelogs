const assert = require('assert');
const generateUid = require('../../lib/Utils.js').generateUid;

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
