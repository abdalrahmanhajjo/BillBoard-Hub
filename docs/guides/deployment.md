# Deployment guide

The target platform is **Vercel**. Everything below also applies to any Node.js host that can run
`next build` / `next start`; the Vercel-specific parts are called out.

## Topology

- One Next.js deployment (App Router, Node.js runtime for API routes, Edge for `src/proxy.ts`)
- One MongoDB database shared by Mongoose and the Auth.js adapter
- ImageKit for uploads — the browser uploads **directly** to ImageKit using a server-signed token,
  so no asset ever passes through a serverless function or its request-body limit
- Stripe Checkout plus a signed webhook
- TLS terminated by the platform

Do not deploy authenticated or database-backed routes as a static export.

## 1. MongoDB Atlas network access

Vercel functions egress from **dynamic, unannounced IP addresses**. Atlas rejects them unless the
project's Network Access list allows `0.0.0.0/0`. This is the single most common cause of a deploy
that builds fine and then times out on every request.

Because the allow-list stops being a control, the database credentials become the only control:
use a dedicated application user with a long random password, `readWrite` on the application
database only — never an Atlas admin user — and rotate it if it ever appears in a log or a preview
environment. For a stricter posture, use Atlas PrivateLink or a static-egress proxy instead of
`0.0.0.0/0`.

## 2. Environment variables

Copy every key from [`.env.example`](../../.env.example) into the Vercel project. Required:

| Variable                            | Scope               | Notes                                             |
| ----------------------------------- | ------------------- | ------------------------------------------------- |
| `MONGODB_URI`                       | All                 | Atlas SRV connection string                       |
| `MONGODB_DB_NAME`                   | All                 | Must be identical for every client                |
| `AUTH_SECRET`                       | All                 | Unique per environment: `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL`              | **Production only** | Canonical origin, e.g. `https://boardly.com`      |
| `IMAGEKIT_PRIVATE_KEY`              | All                 | Server-only                                       |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`   | All                 | Browser-visible                                   |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | All                 | Also derives the `next/image` allow-list          |
| `STRIPE_SECRET_KEY`                 | All                 | Live key in Production, test key in Preview       |
| `STRIPE_WEBHOOK_SECRET`             | All                 | Different per Stripe endpoint and per mode        |
| `RESEND_API_KEY`, `MAIL_FROM`       | All                 | Without them, reset links are logged, not mailed  |

### Why `NEXT_PUBLIC_SITE_URL` must be Production-only

Canonical/OG tags, password-reset links, and Stripe return URLs all resolve through
[`src/shared/config/app-url.ts`](../../src/shared/config/app-url.ts), which picks, in order:

1. `NEXT_PUBLIC_SITE_URL`
2. the Vercel production domain (production deployments only)
3. `VERCEL_URL` — the current deployment, so a **preview redirects back to itself**
4. `NEXTAUTH_URL`, then `http://localhost:3000`

Setting `NEXT_PUBLIC_SITE_URL` for all environments breaks step 3: a preview deployment would send
testers to production after Stripe Checkout, and email reset links from a preview would point at
production.

> **`NEXT_PUBLIC_*` values are inlined at build time.** Changing `NEXT_PUBLIC_SITE_URL` in the
> Vercel dashboard has no effect until you **redeploy**; editing the variable alone will not move
> the canonical domain. The `VERCEL_*` fallbacks are read at runtime, so they need no rebuild.

### Host trust

Auth.js refuses to serve `/api/auth/*` in production unless it trusts the `Host` header. It trusts
it automatically when `VERCEL` is set, so **no configuration is needed on Vercel**.

Any other production host — `next start` behind your own proxy, Docker, a VM — must set
`AUTH_TRUST_HOST=true`, and the proxy must overwrite (never append) the `Host` and
`X-Forwarded-For` headers. Without it every auth request fails with
[`UntrustedHost`](https://errors.authjs.dev#untrustedhost) and login is impossible.

`NEXTAUTH_URL` is not required on Vercel; it is still honoured as a base-URL fallback elsewhere.

## 3. Region

`vercel.json` pins functions to `hnd1` (Tokyo) because the current Atlas cluster resolves to Tokyo.
**Every request makes several sequential database round trips, so a mismatch here is the single
biggest latency lever in the app.**

If you move the database — recommended for a Lebanon-facing product, e.g. Atlas in
`eu-central-1` — change `regions` in `vercel.json` to the matching Vercel region (`fra1`) in the
same change. Keep the function region and the database region in the same cloud region.

## 4. Deploy

Vercel auto-detects Next.js and pnpm; no build command override is needed.

> **`vercel deploy` uploads the working directory, and `.gitignore` does not protect `.env`.**
> Without [`.vercelignore`](../../.vercelignore) the local `.env` is baked into the deployment
> source, where `next.config.ts`'s `loadEnvConfig()` loads it and it silently **overrides the
> project's configured environment variables** — a deployment can look healthy while running on a
> developer's database with their credentials sitting in the build. Keep `.env*` in
> `.vercelignore`, and let every value come from the Vercel project settings.

Git-triggered deploys build the pushed commit; CLI deploys build local files, including uncommitted
changes. Do not mix the two casually — pushing an older commit will overwrite a newer CLI deploy.

```bash
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm lint
pnpm format:check
pnpm test
pnpm build
```

CI (`.github/workflows/ci.yml`) runs the first four on every push and pull request.

## 5. Stripe webhook

1. Stripe Dashboard → Developers → Webhooks → add endpoint
   `https://<your-domain>/api/v1/webhooks/stripe`.
2. Subscribe to exactly these events:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`, `checkout.session.expired`,
   `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`,
   `refund.updated`.
3. Copy the endpoint's signing secret into `STRIPE_WEBHOOK_SECRET` and redeploy.

The webhook route reads the raw body and verifies the signature itself, and `vercel.json` gives it
a 30-second `maxDuration`. Full behaviour: [payments guide](payments.md).

## 6. Database migrations

Migrations are **not** run by the build. Run them from a machine with production credentials, after
the deploy that can read both shapes:

```bash
pnpm migrate:status
pnpm migrate --dry-run
pnpm migrate
```

Applied migrations are recorded in `_migrations`, so re-running is a no-op.

## 7. Create the first administrator

**A fresh database has no admin, and without one nothing can be approved** — registration always
creates an advertiser, and changing a role through the API requires an existing admin. Bootstrap it
once, from a machine pointed at the production database:

```bash
pnpm admin:create -- --email ops@yourdomain.com --first Rami --last Haddad
```

The password is prompted for when `--password` is omitted, so it stays out of shell history. Pass
`--promote` to raise an existing account instead of creating a new one. The script is idempotent:
re-running against an active admin changes nothing.

This is intentionally an operator script and not an HTTP endpoint — any endpoint that can mint
admins is a privilege-escalation hole regardless of how it is guarded.

## 8. Post-deploy verification

```bash
curl -s https://<your-domain>/api/v1/health | jq
```

`GET /api/v1/health` pings MongoDB and returns `200` with `"status":"ok"`, or `503` with
`"status":"degraded"` when the database is unreachable. It reports the environment, region, and
short commit SHA — never secrets — and is unauthenticated so an uptime monitor can poll it.

Then confirm:

1. `/` returns `200` and renders billboard imagery (proves the `next/image` host allow-list).
2. `/api/auth/session` returns JSON.
3. Login works with a non-production test account.
4. A protected endpoint rejects an anonymous request with `401`.
5. `/sitemap.xml` and `/robots.txt` contain the canonical domain, not `localhost`.
6. A test reservation reaches `pending`, and **no** payment is possible until an admin approves it.
7. Stripe sends a test webhook that returns `200`.
8. Logs contain no secret values and no repeated database failures.

## Pre-deployment checklist

- [ ] Atlas Network Access allows Vercel egress, with a scoped application user (not an admin user)
- [ ] All required environment variables set, with `NEXT_PUBLIC_SITE_URL` on Production only
- [ ] `MONGODB_DB_NAME` explicit and identical for all database clients
- [ ] `AUTH_SECRET` unique to the environment
- [ ] First administrator created with `pnpm admin:create`, and its login verified
- [ ] Atlas network access allows Vercel egress, and the `vercel.json` region matches the cluster
- [ ] Database backups and restore testing configured
- [ ] ImageKit keys belong to the correct environment
- [ ] Stripe live/test keys not mixed; webhook created with the event allow-list above
- [ ] Typecheck, lint, format, tests, and production build pass
- [ ] Release-blocking items in [Known limitations](../known-limitations.md) resolved
- [ ] Reservation and schedule conflict smoke tests pass
- [ ] Public device endpoints have authentication and rate limits

## Database release procedure

For additive schema changes:

1. Back up the database.
2. Deploy backward-compatible readers.
3. Run the documented backfill.
4. Validate counts and representative records.
5. Deploy stricter writers/validators.
6. Monitor error and conflict rates.

Record the script version, operator, start/end time, matched count, modified count, and rollback
procedure.

## Rollback

1. Stop new deployments.
2. Promote the previous deployment in the Vercel dashboard (instant rollback).
3. Keep the database at the current shape if the previous version can read it.
4. If not, follow the pre-reviewed data rollback plan.
5. Re-run post-deploy verification and document the incident.

Never perform an unreviewed destructive database rollback.
