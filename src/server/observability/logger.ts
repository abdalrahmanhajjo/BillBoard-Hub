type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown>;

/**
 * Field names whose values must never reach a log sink, matched case
 * insensitively and by substring so `stripeSecretKey` and `passwordHash` are
 * caught as well as `password`.
 */
const REDACTED_KEYS = [
  'password',
  'passwordhash',
  'token',
  'secret',
  'apikey',
  'api_key',
  'authorization',
  'cookie',
  'devicekey',
  'keyhash',
  'mongodb_uri',
  'stripe',
  'creditcard',
];

const REDACTED = '[redacted]';

function shouldRedact(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[-_]/g, '');
  return REDACTED_KEYS.some((needle) => normalized.includes(needle.replace(/[-_]/g, '')));
}

/**
 * Deep-copies a context object, replacing sensitive values. Depth-limited so a
 * cyclic or pathological object cannot hang the logger.
 */
function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return '[truncated]';

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((entry) => redact(entry, depth + 1));
  }

  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        shouldRedact(key) ? REDACTED : redact(entry, depth + 1),
      ]),
    );
  }

  return value;
}

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function minimumLevel(): LogLevel {
  const configured = process.env.LOG_LEVEL as LogLevel | undefined;
  if (configured && configured in LEVEL_ORDER) return configured;
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

function write(level: LogLevel, message: string, context?: LogContext): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[minimumLevel()]) return;

  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? (redact(context) as LogContext) : {}),
  };

  // One JSON object per line: greppable locally and parseable by any log
  // aggregator without a shipping agent.
  const line = JSON.stringify(entry);

  if (level === 'error') {
    console.error(line);
    return;
  }
  if (level === 'warn') {
    console.warn(line);
    return;
  }
  console.log(line);
}

/**
 * Structured application logger.
 *
 * Everything is emitted as single-line JSON with sensitive fields stripped, so
 * production failures are searchable instead of being unread `console.error`
 * output. `captureException` is the single seam an error tracker (Sentry or
 * similar) would be wired into later.
 */
export const logger = {
  debug: (message: string, context?: LogContext) => write('debug', message, context),
  info: (message: string, context?: LogContext) => write('info', message, context),
  warn: (message: string, context?: LogContext) => write('warn', message, context),
  error: (message: string, context?: LogContext) => write('error', message, context),

  /**
   * Records an unexpected failure. Kept separate from `error` so alerting can
   * key on genuine faults rather than on handled, user-facing errors.
   */
  captureException(error: unknown, context?: LogContext): void {
    const normalized =
      error instanceof Error
        ? error
        : new Error(typeof error === 'string' ? error : 'Unknown error');

    write('error', normalized.message, {
      ...context,
      exception: {
        name: normalized.name,
        message: normalized.message,
        stack: normalized.stack,
      },
    });
  },
};
