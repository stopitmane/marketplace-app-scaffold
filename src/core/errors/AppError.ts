/**
 * The `type` values here are a deliberate mirror of the backend's
 * `AppError['type']` (marketplace-backend/src/core/errors/AppError.ts).
 * When the API returns `{ error: { type: 'conflict', message } }`, the
 * client maps it straight across instead of inventing a parallel taxonomy
 * - one error vocabulary for the whole system, not two that have to be
 * kept in sync by hand.
 */
export type AppError =
  | { type: 'network'; message: string; retryable: boolean }
  | { type: 'database'; message: string }
  | { type: 'validation'; field: string; message: string }
  | { type: 'unauthorized'; message: string }
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; message: string }
  | { type: 'conflict'; message: string }
  | { type: 'unknown'; message: string; cause?: unknown };

export function networkError(message: string, retryable = true): AppError {
  return { type: 'network', message, retryable };
}
export function databaseError(message: string): AppError {
  return { type: 'database', message };
}
export function validationError(field: string, message: string): AppError {
  return { type: 'validation', field, message };
}
export function unknownError(cause: unknown): AppError {
  return { type: 'unknown', message: cause instanceof Error ? cause.message : 'Unexpected error', cause };
}
