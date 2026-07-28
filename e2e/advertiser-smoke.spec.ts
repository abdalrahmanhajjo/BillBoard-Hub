import { expect, test } from '@playwright/test';

const ADVERTISER_ROUTES = [
  { path: '/user/advertiser', heading: /dashboard/i },
  { path: '/user/advertiser/campaigns', heading: /campaigns/i },
  { path: '/user/advertiser/bookings', heading: /reservations/i },
  { path: '/user/advertiser/creatives', heading: /creatives/i },
  { path: '/user/advertiser/invoices', heading: /invoices/i },
  { path: '/user/advertiser/reports', heading: /reports/i },
  { path: '/user/advertiser/profile', heading: /profile/i },
  { path: '/user/advertiser/settings', heading: /settings/i },
];

test.describe('advertiser workspace', () => {
  for (const route of ADVERTISER_ROUTES) {
    test(`${route.path} renders`, async ({ page }) => {
      const failures: string[] = [];
      page.on('pageerror', (error) => failures.push(error.message));

      const response = await page.goto(route.path);

      expect(response?.status(), `${route.path} returned ${response?.status()}`).toBeLessThan(400);
      await expect(page.getByRole('heading', { name: route.heading }).first()).toBeVisible();

      // The Next.js dev overlay renders this when a render throws.
      await expect(page.locator('text=Unhandled Runtime Error')).toHaveCount(0);
      expect(failures, `uncaught errors on ${route.path}`).toEqual([]);
    });
  }

  test('sidebar navigates to every section', async ({ page }) => {
    await page.goto('/user/advertiser');

    for (const label of ['Campaigns', 'Reservations', 'Invoices', 'Reports', 'Settings']) {
      await page.getByRole('link', { name: label, exact: true }).click();
      await expect(
        page.getByRole('heading', { name: new RegExp(label, 'i') }).first(),
      ).toBeVisible();
    }
  });
});

/**
 * The regression this suite exists for: a campaign card once linked to
 * /dashboard/advertiser/campaigns/:id, a route that does not exist, and it
 * shipped because nothing ever opened the page. This walks the real links on
 * every screen and fails on any that 404.
 */
test('no internal link 404s', async ({ page, request }) => {
  const checked = new Set<string>();
  const broken: string[] = [];

  for (const route of ADVERTISER_ROUTES) {
    await page.goto(route.path);

    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href') ?? ''));

    for (const href of hrefs) {
      const target = href.split('#')[0];
      if (!target || checked.has(target)) continue;
      checked.add(target);

      const response = await request.get(target, { maxRedirects: 0 });
      if (response.status() === 404) {
        broken.push(`${target} (linked from ${route.path})`);
      }
    }
  }

  expect(checked.size, 'expected to find internal links to check').toBeGreaterThan(0);
  expect(broken, 'links pointing at routes that do not exist').toEqual([]);
});
