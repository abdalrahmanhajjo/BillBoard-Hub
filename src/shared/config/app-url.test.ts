import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { absoluteAppUrl, appUrl } from '@/shared/config/app-url';

const URL_VARS = [
  'NEXT_PUBLIC_SITE_URL',
  'VERCEL_ENV',
  'VERCEL_PROJECT_PRODUCTION_URL',
  'VERCEL_URL',
  'NEXTAUTH_URL',
] as const;

const original: Partial<Record<(typeof URL_VARS)[number], string | undefined>> = {};

beforeEach(() => {
  for (const key of URL_VARS) {
    original[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of URL_VARS) {
    if (original[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = original[key];
    }
  }
});

describe('appUrl', () => {
  it('falls back to localhost when nothing is configured', () => {
    expect(appUrl()).toBe('http://localhost:3000');
  });

  it('prefers the operator-configured canonical origin', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://boardly.com/';
    process.env.VERCEL_ENV = 'production';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'boardly.vercel.app';

    expect(appUrl()).toBe('https://boardly.com');
  });

  it('uses the stable production domain on a Vercel production deployment', () => {
    process.env.VERCEL_ENV = 'production';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'boardly.vercel.app';
    process.env.VERCEL_URL = 'boardly-abc123.vercel.app';

    expect(appUrl()).toBe('https://boardly.vercel.app');
  });

  // A preview must send Stripe and password-reset links back to itself, not to
  // production, or testers leave the deployment they are testing.
  it('uses the deployment URL on a preview so redirects return to the preview', () => {
    process.env.VERCEL_ENV = 'preview';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'boardly.vercel.app';
    process.env.VERCEL_URL = 'boardly-abc123.vercel.app';

    expect(appUrl()).toBe('https://boardly-abc123.vercel.app');
  });

  it('honours NEXTAUTH_URL off Vercel', () => {
    process.env.NEXTAUTH_URL = 'https://staging.example.com';

    expect(appUrl()).toBe('https://staging.example.com');
  });

  it('ignores an unparseable value instead of emitting a broken origin', () => {
    process.env.NEXT_PUBLIC_SITE_URL = ':://not a url';
    process.env.NEXTAUTH_URL = 'https://staging.example.com';

    expect(appUrl()).toBe('https://staging.example.com');
  });
});

describe('absoluteAppUrl', () => {
  it('joins a path onto the resolved origin', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://boardly.com';

    expect(absoluteAppUrl('/reset-password?token=abc')).toBe(
      'https://boardly.com/reset-password?token=abc',
    );
    expect(absoluteAppUrl()).toBe('https://boardly.com/');
  });
});
