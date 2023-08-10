
const statuses = require('statuses');
const httpErrors = require('http-errors')

module.exports = function ({
  onInternalServerError = (err) => console.error(err.stack), includeStack = false,
} = {}) {
  return function errorHandlerJson(err, req, res, next) {
    let status = 500;

    if (httpErrors.isHttpError(err)) {
      const maybeStatus = err.status || err.statusCode;
      if (typeof maybeStatus === 'number' && maybeStatus >= 400) status = maybeStatus;
    }

    res.statusCode = status;

    const body = {
      status: status
    };

    // maybe include the stacktrace
    if (includeStack) body.stack = err.stack;

    // internal server errors
    if (status >= 500 && !err.expose) {
      onInternalServerError(err);
      body.message = err.expose ? err.message : statuses.message[status];
      res.json(body);
      return;
    }

    // client errors
    body.message = err.message;

    const {
      expose: ignored1, message: ignored2, stack: ignored3, status: ignored4, statusCode: ignored5,
      code, name, type,
      ...errProps
    } = err

    // always include these (maybe inherited) props, for historical reasons
    if (code) body.code = code;
    if (name) body.name = name;
    if (type) body.type = type;

    Object.entries(errProps).forEach(([key, value]) => {
      body[key] = value;
    });

    res.json(body);
  }
}
