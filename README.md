
# error-handler-json

[![NPM version][npm-image]][npm-url]
![Build status](https://github.com/mifi/error-handler-json/actions/workflows/test.yml/badge.svg)

An error handler for JSON APIs, meant to be used with [http-errors](https://github.com/jshttp/http-errors)-style errors. The default `express` error handler returns HTML, but one might want to instead return JSON when designing a pure API instead of a website.

**Note:** This is a fork of the unmaintained and archived [api-error-handler](https://github.com/expressjs/api-error-handler).

## Example


```js
const createError = require('http-errors');
const errorHandler = require('error-handler-json');

app.get('/api/endpoint', (req, res) => {
  throw createError(400, 'Invalid data sent');
});

app.use(errorHandler());
```

A call to `/api/endpoint` will return a 400 with the following JSON response:
```js
{
  "status": 400,
  "message": "Invalid data sent",
  "name": "BadRequestError",
  "stack": "BadRequestError: ...",
}
```

## API

### .use(errorHandler([options]))

Currently no options.

### Errors

4xx errors are exposed to the client.
Properties exposed are:

- `message`
- `type`
- `name`
- `code`
- `status`

5xx errors are not exposed to the client.
Instead, they are given a generic `message` as well as the `type`.

[npm-image]: https://img.shields.io/npm/v/error-handler-json.svg?style=flat-square
[npm-url]: https://npmjs.org/package/error-handler-json
