import type { Request, Response, NextFunction } from 'express';
import { AppErrorException, statusForErrorType } from '../errors/AppError';
import { logger } from '../logger/Logger';

/**
 * The one place HTTP status codes and error response shape get decided.
 * Controllers/services just `throw` (via validationError/notFoundError/etc)
 * and never touch `res` for the error path - this is what keeps that
 * concern from being duplicated across every route handler.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppErrorException) {
    const status = statusForErrorType[err.appError.type];
    if (status >= 500) {
      logger.error('Unhandled AppError', err, { requestId: req.requestId, path: req.path });
    }
    return res.status(status).json({
      error: {
        type: err.appError.type,
        message: err.appError.message,
        requestId: req.requestId,
      },
    });
  }

  logger.error('Unexpected error', err, { requestId: req.requestId, path: req.path });
  return res.status(500).json({
    error: { type: 'unknown', message: 'Something went wrong', requestId: req.requestId },
  });
}

/** Wraps an async route handler so a rejected promise reaches errorHandler
 *  instead of crashing the process (Express 4 doesn't do this for you). */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    void Promise.resolve(fn(req, res, next)).catch(next);
  };
}
