import type { APIRequestContext, Page } from '@playwright/test';

export type TestAdvertiser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

const PASSWORD = 'Str0ngPassphrase!';

export function buildAdvertiser(): TestAdvertiser {
  // Unique per run so parallel workers never collide on the email index.
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    email: `e2e-${unique}@example.com`,
    password: PASSWORD,
    firstName: 'Smoke',
    lastName: 'Tester',
  };
}

/** Registers through the real API so the run does not depend on seeded data. */
export async function registerAdvertiser(
  request: APIRequestContext,
  advertiser: TestAdvertiser,
): Promise<void> {
  const response = await request.post('/api/v1/auth/register', {
    data: {
      firstName: advertiser.firstName,
      lastName: advertiser.lastName,
      email: advertiser.email,
      password: advertiser.password,
      confirmPassword: advertiser.password,
      acceptTerms: true,
    },
  });

  if (!response.ok()) {
    throw new Error(`registration failed: ${response.status()} ${await response.text()}`);
  }
}

/** Signs in through the form rather than the API, so the login page is covered too. */
export async function signIn(page: Page, advertiser: TestAdvertiser): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(advertiser.email);
  await page.getByLabel('Password', { exact: true }).fill(advertiser.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 30_000 });
}
