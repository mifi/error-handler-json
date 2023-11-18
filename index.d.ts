declare function createErrorHandler ({
  onInternalServerError,
  includeStack,
}: {
  onInternalServerError?: (err: unknown) => void
  includeStack?: boolean,
}): import('express').ErrorRequestHandler;

export = createErrorHandler;
