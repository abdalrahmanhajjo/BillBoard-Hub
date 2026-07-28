# Known limitations and production gaps

This document separates implemented behavior from production-ready guarantees.

## Release blockers

### Public device endpoints have no device authentication

Now-playing is read-only, but impression ingestion accepts unauthenticated requests. Add per-device
credentials, replay protection, and rate limiting before deploying physical screens.

### Auth token TTL configuration has no fallback validation

Missing or invalid token TTL environment values become `NaN`. Add validated configuration parsing
and fail startup with a descriptive error.

### Database fallback names differ

Mongoose defaults to `billboard-hub`; the Auth.js adapter defaults to `billboard_hub`. Always set
`MONGODB_DB_NAME` and align the code defaults.

### Account deactivation is not immediate session revocation

Inactive users cannot sign in, but the JWT callback does not reload account state on every session
refresh. Add token versioning, a revocation store, or periodic database revalidation where
immediate termination is required.

### User permission mapping is incomplete

The user policy references `users.update:any` and `users.delete:self`, but those permissions are not
currently assigned to the corresponding admin and advertiser role arrays. Review the intended
account-management rules and align the permission map before enabling the unfinished user
management screens.

## Reliability and scale

- No automated unit, integration, or browser test suite
- No dedicated health/readiness endpoint
- No migration framework
- No background job runner
- No structured logging, tracing, or request correlation
- No centralized rate limiting
- Public catalog and some admin lists return the full collection without pagination
- Reservation approval uses application-level conflict checks without a database transaction or
  atomic capacity lock; simultaneous approvals can race
- Stripe webhooks are processed in the request instead of a durable background queue
- Payment and event schema changes rely on additive Mongoose defaults because no migration runner
  exists

## Domain completeness

- Booking `completed` status exists but has no dedicated transition endpoint
- Booking confirmation is a workflow status, not a legally finalized order
- Password recovery remains a placeholder
- Playlist creation checks that creatives exist but not that they are approved
- Delete operations do not consistently define or enforce cross-module cascade behavior
- Impression records do not verify that the optional schedule id matches the active schedule

## Security and privacy

- Remote Next.js images allow any HTTPS hostname; restrict to trusted CDN hosts
- File upload content scanning and malware controls are not documented or enforced server-side
- No audit-log collection for admin moderation or destructive changes
- Manual payment notes provide reconciliation context but do not replace a general admin audit log
- No account lockout or brute-force throttling
- No documented data retention or deletion policy
- No cookie-consent implementation for jurisdictions where required

## Documentation compatibility

The canonical reference is [API reference](reference/api.md). The two legacy billboard document
paths now contain compatibility pointers so existing links continue to work while consumers move
to the consolidated reference.
