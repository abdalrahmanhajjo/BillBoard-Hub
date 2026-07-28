import { afterEach, describe, expect, it } from 'vitest';
import { mailer } from '@/server/mail/mailer';

const originalApiKey = process.env.RESEND_API_KEY;
const originalNodeEnv = process.env.NODE_ENV;

// `NODE_ENV` is declared read-only on ProcessEnv, so overriding it for a test
// needs a mutable view of the same object.
const mutableEnv = process.env as Record<string, string | undefined>;

function setEnv(key: 'RESEND_API_KEY' | 'NODE_ENV', value: string | undefined) {
  if (value === undefined) {
    delete mutableEnv[key];
    return;
  }
  mutableEnv[key] = value;
}

afterEach(() => {
  setEnv('RESEND_API_KEY', originalApiKey);
  setEnv('NODE_ENV', originalNodeEnv);
});

describe('mailer.allowsLinkPreview', () => {
  it('allows previews in development when no provider is configured', () => {
    setEnv('NODE_ENV', 'development');
    setEnv('RESEND_API_KEY', undefined);

    expect(mailer.allowsLinkPreview()).toBe(true);
  });

  // Handing a reset link back to the browser reveals that an address has an
  // account. These three cases are the guard against that reaching real users.
  it('refuses previews in production even without a provider', () => {
    setEnv('NODE_ENV', 'production');
    setEnv('RESEND_API_KEY', undefined);

    expect(mailer.allowsLinkPreview()).toBe(false);
  });

  it('refuses previews in production when a provider is configured', () => {
    setEnv('NODE_ENV', 'production');
    setEnv('RESEND_API_KEY', 're_test_key');

    expect(mailer.allowsLinkPreview()).toBe(false);
  });

  it('refuses previews in development once a provider can actually deliver', () => {
    setEnv('NODE_ENV', 'development');
    setEnv('RESEND_API_KEY', 're_test_key');

    expect(mailer.allowsLinkPreview()).toBe(false);
  });
});

describe('mailer.isConfigured', () => {
  it('is false without an API key and true with one', () => {
    setEnv('RESEND_API_KEY', undefined);
    expect(mailer.isConfigured()).toBe(false);

    setEnv('RESEND_API_KEY', 're_test_key');
    expect(mailer.isConfigured()).toBe(true);
  });
});
