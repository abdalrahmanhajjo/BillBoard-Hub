import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { request as playwrightRequest, type FullConfig } from '@playwright/test';
import { buildAdvertiser, registerAdvertiser } from './support/auth';

export const STORAGE_STATE = path.join(process.cwd(), 'e2e/.auth/advertiser.json');

/**
 * Creates one advertiser for the whole run and saves its session.
 *
 * Registering per test trips the account-creation rate limit (5/hour per
 * client) after the fifth spec — correct behaviour from the API, and a good
 * reason to authenticate once rather than repeatedly.
 */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://localhost:3000';
  const advertiser = buildAdvertiser();
  const context = await playwrightRequest.newContext({ baseURL });

  // Registers through the shared helper rather than a second copy of the
  // payload: this setup previously drifted from the real contract and broke
  // every e2e run when registration started requiring the company fields.
  await registerAdvertiser(context, advertiser);

  const login = await context.post('/api/v1/auth/login', {
    data: { email: advertiser.email, password: advertiser.password },
  });

  if (!login.ok()) {
    throw new Error(`e2e setup: login failed (${login.status()}): ${await login.text()}`);
  }

  await mkdir(path.dirname(STORAGE_STATE), { recursive: true });
  await context.storageState({ path: STORAGE_STATE });
  await writeFile(
    path.join(path.dirname(STORAGE_STATE), 'advertiser.meta.json'),
    JSON.stringify(advertiser, null, 2),
  );
  await context.dispose();
}
