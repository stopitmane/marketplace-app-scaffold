export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: unknown, meta?: Record<string, unknown>): void;
}

declare const __DEV__: boolean;

export class ConsoleLogger implements Logger {
  debug(message: string, meta?: Record<string, unknown>) {
    if (__DEV__) console.debug(`[DEBUG] ${message}`, meta ?? '');
  }
  info(message: string, meta?: Record<string, unknown>) {
    console.info(`[INFO] ${message}`, meta ?? '');
  }
  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(`[WARN] ${message}`, meta ?? '');
  }
  error(message: string, error?: unknown, meta?: Record<string, unknown>) {
    console.error(`[ERROR] ${message}`, error, meta ?? '');
    // TODO: forward to Sentry.captureException(error) once crash reporting is wired in
  }
}
