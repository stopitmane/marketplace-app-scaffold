/**
 * Every error crossing a service/repository boundary is one of these -
 * never a bare `throw new Error(string)`. The error middleware
 * (core/middleware/errorHandler.ts) maps each `type` to an HTTP status and
 * a stable client-facing error code, so the API's error shape is
 * predictable for the mobile client instead of leaking stack traces.
 */
export type AppError =
  | { type: 'validation'; field: string; message: string }
  | { type: 'not_found'; resource: string; message: string }
  | { type: 'unauthorized'; message: string }
  | { type: 'forbidden'; message: string }
  | { type: 'conflict'; message: string }
  | { type: 'database'; message: string; cause?: unknown }
  | { type: 'unknown'; message: string; cause?: unknown };

export class AppErrorException extends Error {
  constructor(public readonly appError: AppError) {
    super(appError.message);
    this.name = 'AppErrorException';
  }
}

export function validationError(field: string, message: string): never {
  throw new AppErrorException({ type: 'validation', field, message });
}
export function notFoundError(resource: string, message = `${resource} not found`): never {
  throw new AppErrorException({ type: 'not_found', resource, message });
}
export function unauthorizedError(message = 'Not authenticated'): never {
  throw new AppErrorException({ type: 'unauthorized', message });
}
export function forbiddenError(message = 'Not permitted'): never {
  throw new AppErrorException({ type: 'forbidden', message });
}
export function conflictError(message: string): never {
  throw new AppErrorException({ type: 'conflict', message });
}

export const statusForErrorType: Record<AppError['type'], number> = {
  validation: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  database: 500,
  unknown: 500,
};
