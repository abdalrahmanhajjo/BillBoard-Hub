# Deployment guide

## Supported topology

Boardly is deployed as a Node.js-capable Next.js application with:

- One application deployment
- One MongoDB database shared by Mongoose and the Auth.js adapter
- Optional ImageKit integration
- Optional Stripe Checkout and signed webhooks
- TLS termination at the hosting platform or reverse proxy

Do not deploy authenticated or database-backed routes as static exports.

## Pre-deployment checklist

- [ ] All required environment variables are configured
- [ ] `MONGODB_DB_NAME` is explicit and identical for all database clients
- [ ] `AUTH_SECRET` is unique to the environment
- [ ] `NEXTAUTH_URL` uses the canonical HTTPS origin
- [ ] MongoDB network access is restricted to the runtime
- [ ] Database backups and restore testing are configured
- [ ] ImageKit keys belong to the correct environment
- [ ] Stripe merchant entity is eligible and test/live keys are not mixed
- [ ] Stripe webhook points to `/api/v1/webhooks/stripe` with the documented event allowlist
- [ ] TypeScript, lint, formatting, and production build pass
- [ ] Release-blocking items in [Known limitations](../known-limitations.md) are resolved
- [ ] Reservation and schedule conflict smoke tests pass
- [ ] Public device endpoints have authentication and rate limits

## Build and start

```bash
pnpm install --frozen-lockfile
pnpm quality
pnpm audit --prod
pnpm peers check
pnpm build
pnpm start
```

The runtime must permit outbound connections to MongoDB, ImageKit, and Stripe when their
respective features are enabled.

## Health verification

The project does not yet expose a dedicated health endpoint. After deploy, verify:

1. `/` returns `200`.
2. `/api/auth/session` returns JSON.
3. `/api/v1/public/billboards` returns the standard JSON envelope.
4. Login works with a non-production test account.
5. A protected endpoint rejects an anonymous request with `401`.
6. Server logs contain no secret values or repeated database failures.

Add a dedicated readiness endpoint before configuring strict orchestration health probes.

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

Application rollback:

1. Stop new deployments.
2. Restore the previous immutable application version.
3. Keep the database at the current shape if the previous version can read it.
4. If not, follow the pre-reviewed data rollback plan.
5. Re-run health verification and document the incident.

Never perform an unreviewed destructive database rollback.
