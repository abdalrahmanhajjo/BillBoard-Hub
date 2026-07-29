# Release checklist

## Change readiness

- [ ] Scope and acceptance criteria are documented
- [ ] Architecture boundaries are preserved
- [ ] Contracts and permissions match the implementation
- [ ] Data migration and rollback are documented
- [ ] User-facing and API documentation are updated

## Automated validation

```bash
pnpm quality
pnpm audit --prod
pnpm peers check
pnpm build
```

- [ ] TypeScript passes
- [ ] ESLint passes
- [ ] Formatting passes
- [ ] Production build passes
- [ ] Automated tests pass when introduced

## Manual validation

- [ ] Homepage and public catalog return `200`
- [ ] Auth.js session and CSRF endpoints return JSON
- [ ] Anonymous protected API request returns `401`
- [ ] Admin and advertiser dashboard role gates work
- [ ] Billboard images resolve
- [ ] Reservation submission computes the expected server total
- [ ] Static conflict and digital capacity scenarios behave correctly
- [ ] Approved card reservation completes Stripe test Checkout
- [ ] Signed payment webhook updates both payment and booking status
- [ ] Checkout cancellation makes no charge and can be retried
- [ ] Offline payment reconciliation validates partial and full amounts
- [ ] Full Stripe refund synchronizes and releases reservation dates
- [ ] Creative upload and moderation work
- [ ] Playlist and schedule validations work
- [ ] Now-playing response works for active and empty schedules
- [ ] Impression event appears in admin analytics
- [ ] Mobile and keyboard review is complete

## Production safety

- [ ] Known release blockers are resolved or explicitly accepted by the owner
- [ ] Secrets are configured and not present in build output
- [ ] Backup is recent and restore procedure is known
- [ ] Monitoring and incident owner are assigned
- [ ] Rollback version is available
- [ ] Any data backfill was rehearsed and reports counts

## Post-deployment

- [ ] Health verification completed
- [ ] Error, latency, login, conflict, and device-ingestion signals reviewed
- [ ] Representative public and authenticated journeys completed
- [ ] Release timestamp and version recorded
- [ ] Migration results and exceptions recorded
- [ ] Stakeholders notified
