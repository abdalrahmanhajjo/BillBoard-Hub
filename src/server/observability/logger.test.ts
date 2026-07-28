import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logger } from '@/server/observability/logger';

const mutableEnv = process.env as Record<string, string | undefined>;
const originalLevel = mutableEnv.LOG_LEVEL;

let logged: string[] = [];

beforeEach(() => {
  logged = [];
  mutableEnv.LOG_LEVEL = 'debug';
  vi.spyOn(console, 'log').mockImplementation((line: string) => void logged.push(line));
  vi.spyOn(console, 'warn').mockImplementation((line: string) => void logged.push(line));
  vi.spyOn(console, 'error').mockImplementation((line: string) => void logged.push(line));
});

afterEach(() => {
  vi.restoreAllMocks();
  mutableEnv.LOG_LEVEL = originalLevel;
});

function lastEntry() {
  return JSON.parse(logged[logged.length - 1]);
}

describe('logger output', () => {
  it('emits one parseable JSON object per line', () => {
    logger.info('something happened', { bookingId: 'abc' });

    const entry = lastEntry();
    expect(entry.level).toBe('info');
    expect(entry.message).toBe('something happened');
    expect(entry.bookingId).toBe('abc');
    expect(typeof entry.timestamp).toBe('string');
  });

  it('respects LOG_LEVEL', () => {
    mutableEnv.LOG_LEVEL = 'warn';

    logger.info('should not appear');
    expect(logged).toHaveLength(0);

    logger.error('should appear');
    expect(logged).toHaveLength(1);
  });
});

// A logger that leaks credentials into a log aggregator is worse than no
// logger, so redaction is the behaviour most worth pinning down.
describe('logger redaction', () => {
  it.each([
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'apiKey',
    'api_key',
    'authorization',
    'cookie',
    'deviceKey',
    'keyHash',
    'stripeSecretKey',
  ])('redacts %s', (field) => {
    logger.info('login attempt', { [field]: 'super-secret-value' });

    expect(logged[0]).not.toContain('super-secret-value');
    expect(lastEntry()[field]).toBe('[redacted]');
  });

  it('redacts nested values', () => {
    logger.info('request', { user: { email: 'a@b.com', password: 'hunter2' } });

    expect(logged[0]).not.toContain('hunter2');
    expect(lastEntry().user.email).toBe('a@b.com');
  });

  it('keeps non-sensitive fields intact', () => {
    logger.info('booking', { reference: 'BR-ABC123', total: 42 });

    const entry = lastEntry();
    expect(entry.reference).toBe('BR-ABC123');
    expect(entry.total).toBe(42);
  });

  it('survives a cyclic object instead of hanging', () => {
    const cyclic: Record<string, unknown> = { name: 'loop' };
    cyclic.self = cyclic;

    expect(() => logger.info('cyclic', cyclic)).not.toThrow();
    expect(logged).toHaveLength(1);
  });
});

describe('captureException', () => {
  it('records the name, message, and stack', () => {
    logger.captureException(new Error('stripe exploded'), { source: 'stripe-webhook' });

    const entry = lastEntry();
    expect(entry.level).toBe('error');
    expect(entry.source).toBe('stripe-webhook');
    expect(entry.exception.message).toBe('stripe exploded');
    expect(typeof entry.exception.stack).toBe('string');
  });

  it('normalises a non-Error throw', () => {
    logger.captureException('just a string');

    expect(lastEntry().exception.message).toBe('just a string');
  });
});
