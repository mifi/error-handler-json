
var error = require('http-errors');
var request = require('supertest');
var express = require('express');
var assert = require('assert');
const { describe, it } = require('node:test');

var handler = require('..');

const createHandler = ({ onInternalServerError = () => {}, includeStack } = {}) => handler({ onInternalServerError, includeStack })

async function runTest(app, expectedStatus, onResponse) {
  const server = app.listen()

  return new Promise((resolve, reject) => {
    request(server)
    .get('/')
    .expect(expectedStatus)
    .end((err, res) => {
      try {
        assert.ifError(err);
        onResponse(res)

        resolve()
      } catch (testErr) {
        reject(testErr);
      } finally {
        server.close()
      }
    })
  })
}

describe('Error Handler JSON', () => {
  it('5xx', async ({ mock }) => {
    const onInternalServerError = mock.fn();

    var app = express();
    app.use((req, res, next) => {
      next(error(501, 'message', {  }));
    });
    app.use(createHandler({ onInternalServerError }));

    await runTest(app, 501, (res) => {
      assert.deepStrictEqual(res.body, {
        message: 'Not Implemented',
        status: 501,
      })

      assert.strictEqual(onInternalServerError.mock.callCount(), 1);
      const arg = onInternalServerError.mock.calls[0].arguments[0];
      assert(arg instanceof Error);
      assert.strictEqual(arg.message, 'message');
    })
  })

  it('4xx', async () => {
    var app = express();
    app.use((req, res, next) => {
      next(error(400, 'Invalid data sent'));
    });
    app.use(createHandler());

    await runTest(app, 400, (res) => {
      assert.deepStrictEqual(res.body, {
        message: 'Invalid data sent',
        status: 400,
        name: 'BadRequestError',
      })
    })
  })

  it('4xx with additional props', async () => {
    var app = express();
    app.use((req, res, next) => {
      next(error(401, 'message', {
        type: 'a',
        code: 'b',
        other: 'prop',
      }));
    });
    app.use(createHandler());

    await runTest(app, 401, (res) => {
      assert.deepStrictEqual(res.body, {
        message: 'message',
        status: 401,
        type: 'a',
        code: 'b',
        name: 'UnauthorizedError',
        other: 'prop',
      })
    })
  })

  it('handle passing error', async () => {
    var app = express();
    app.use((req, res, next) => {
      const err = Object.assign(new Error('test'), { code: 'ENOENT', other: 'prop' })
      next(error(400, err));
    });
    app.use(createHandler());

    await runTest(app, 400, (res) => {
      assert.deepStrictEqual(res.body, {
        message: 'test',
        name: 'Error',
        status: 400,
        code: 'ENOENT',
        other: 'prop',
      })
    })
  })

  it('should not process similar non http-errors errors', async () => {
    var app = express();
    app.use((req, res, next) => {
      const otherError = new Error('This error should not be handled')
      otherError.status = 400
      otherError.statusCode = 400
      otherError.code = 'testcode'
      otherError.other = 'prop'
      next(otherError);
    });
    app.use(createHandler());

    await runTest(app, 500, (res) => {
      assert.deepStrictEqual(res.body, {
        message: 'Internal Server Error',
        status: 500,
      })
    })
  })
})
