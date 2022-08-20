
var error = require('http-errors');
var request = require('supertest');
var express = require('express');
var assert = require('assert');

var handler = require('..');

describe('Error Handler JSON', () => {
  it('5xx', (done) => {
    var app = express();
    app.use((req, res, next) => {
      next(error(501, 'lol'));
    });
    app.use(handler());

    const server = app.listen()

    request(server)
      .get('/')
      .expect(501)
      .end((err, res) => {
        assert.ifError(err);

        var body = res.body;
        assert.equal(body.message, 'Not Implemented');
        assert.equal(body.status, 501);
        server.close()
        done();
      })
  })

  it('4xx', (done) => {
    var app = express();
    app.use((req, res, next) => {
      next(error(401, 'lol', {
        type: 'a',
        code: 'b'
      }));
    });
    app.use(handler());

    const server = app.listen()

    request(server)
      .get('/')
      .expect(401)
      .end((err, res) => {
        assert.ifError(err);

        var body = res.body;
        assert.equal(body.message, 'lol');
        assert.equal(body.status, 401);
        assert.equal(body.type, 'a');
        assert.equal(body.code, 'b');
        server.close()
        done();
      })
  })
})
