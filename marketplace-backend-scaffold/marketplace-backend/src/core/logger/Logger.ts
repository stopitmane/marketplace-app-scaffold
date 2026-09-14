/**
 * Structured (JSON) logging so log lines are machine-parseable once you
 * ship this somewhere real (even just `| jq` locally). Every log line
 * carries requestId when available, so you can grep one request's full
 * lifecycle out of interleaved concurrent-request logs.
 */
type Level = 'debug' | 'info' | 'warn' | 'error';

function write(level: Level, message: string, meta: Record<string, unknown> = {}) {
  const line = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
  const out = level === 'error' ? console.error : console.log;
  out(JSON.stringify(line));
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => write('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => write('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write('warn', message, meta),
  error: (message: string, error?: unknown, meta?: Record<string, unknown>) =>
    write('error', message, { ...meta, error: error instanceof Error ? error.stack : error }),
};
