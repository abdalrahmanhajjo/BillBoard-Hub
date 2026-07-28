import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

/**
 * Browser smoke tests.
 *
 * Deliberately separate from the vitest suite: those cover pure functions, this
 * covers whether a page actually renders and whether its links go anywhere. It
 * reuses an already-running dev server when there is one, so local runs do not
 * pay a cold boot.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  // The dev server compiles routes on demand, so unbounded parallelism makes
  // first-hit requests flaky rather than revealing real failures.
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,

  globalSetup: './e2e/global-setup.ts',

  use: {
    baseURL: BASE_URL,
    // Session created once in global setup; registering per test would trip
    // the account-creation rate limit.
    storageState: path.join(process.cwd(), 'e2e/.auth/advertiser.json'),
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    command: 'pnpm dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
