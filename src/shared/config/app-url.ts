/**
 * The one place that answers "what is this deployment's public origin?".
 *
 * Three features need an absolute URL that is correct in every environment:
 * canonical/OG metadata, password-reset links, and the Stripe Checkout
 * return URLs. Each used to hard-code its own fallback chain ending in
 * `http://localhost:3000`, which silently ships localhost links the moment the
 * app runs somewhere the operator did not set `NEXTAUTH_URL`.
 *
 * Resolution order, first match wins:
 *
 * 1. `NEXT_PUBLIC_SITE_URL` — the operator's canonical domain. Set this for the
 *    Production environment only; setting it for Preview too would make preview
 *    deployments hand out production links.
 * 2. On Vercel production, the project's stable production domain.
 * 3. On any other Vercel deployment (preview), that deployment's own URL, so a
 *    preview redirects back to itself rather than to production.
 * 4. `NEXTAUTH_URL`, then localhost, for local and non-Vercel hosts.
 *
 * Only `NEXT_PUBLIC_SITE_URL` survives into a client bundle; the `VERCEL_*`
 * variables are server-only and read as `undefined` in the browser. Callers
 * that may run on the client should therefore have `NEXT_PUBLIC_SITE_URL` set.
 */
const DEFAULT_APP_URL = 'http://localhost:3000';

/**
 * Vercel exposes bare hostnames (`my-app.vercel.app`), not URLs, so a missing
 * scheme is assumed to be HTTPS rather than treated as invalid.
 */
function toOrigin(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(candidate).origin;
  } catch {
    return null;
  }
}

export function appUrl(): string {
  const isVercelProduction = process.env.VERCEL_ENV === 'production';

  return (
    toOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    (isVercelProduction ? toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) : null) ??
    toOrigin(process.env.VERCEL_URL) ??
    toOrigin(process.env.NEXTAUTH_URL) ??
    DEFAULT_APP_URL
  );
}

/** Absolute URL for an app-relative path, e.g. `absoluteAppUrl('/login')`. */
export function absoluteAppUrl(path = '/'): string {
  return new URL(path, `${appUrl()}/`).toString();
}
