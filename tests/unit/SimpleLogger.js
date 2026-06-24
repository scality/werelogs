const assert = require('assert');
const { PassThrough } = require('stream');

const SimpleLogger = require('../../lib/SimpleLogger');

function captureLog(fn) {
    const pass = new PassThrough();
    const records = [];
    pass.on('data', data => records.push(data.toString()));
    const logger = new SimpleLogger('test', [{ level: 'trace', stream: pass }]);
    fn(logger);
    return records.map(r => JSON.parse(r.trim()));
}

describe('SimpleLogger Error serialization', () => {
    it('serializes a plain Error with its message and name', () => {
        const [entry] = captureLog(log => {
            log.error({ error: new Error('boom') }, 'plain Error');
        });

        assert.strictEqual(entry.error.message, 'boom');
        assert.strictEqual(entry.error.name, 'Error');
    });

    it('preserves own enumerable props on Error subclasses', () => {
        class S3ServiceException extends Error {
            constructor(opts) {
                super(opts.message);
                this.name = opts.name;
            }
        }
        const err = new S3ServiceException({
            name: 'NoSuchBucket',
            message: 'The specified bucket does not exist',
        });
        err.$metadata = { httpStatusCode: 404 };

        const [entry] = captureLog(log => {
            log.error({ error: err }, 'sdk v3 style');
        });

        assert.strictEqual(entry.error.message, 'The specified bucket does not exist');
        assert.strictEqual(entry.error.name, 'NoSuchBucket');
        assert.deepStrictEqual(entry.error.$metadata, { httpStatusCode: 404 });
    });

    it('does not include the stack', () => {
        const [entry] = captureLog(log => {
            log.error({ error: new Error('boom') }, 'no stack');
        });

        assert.strictEqual(entry.error.stack, undefined);
    });

    it('leaves non-Error fields untouched', () => {
        const [entry] = captureLog(log => {
            log.info({ foo: 1, nested: { bar: 'baz' } }, 'plain object');
        });

        assert.strictEqual(entry.foo, 1);
        assert.deepStrictEqual(entry.nested, { bar: 'baz' });
    });

    it('serializes Errors nested inside other fields', () => {
        const [entry] = captureLog(log => {
            log.error({
                // eslint-disable-next-line camelcase
                healthStatus: { aws_location: { error: new Error('down') } },
            }, 'nested');
        });

        assert.strictEqual(entry.healthStatus.aws_location.error.message, 'down');
        assert.strictEqual(entry.healthStatus.aws_location.error.name, 'Error');
    });
});
