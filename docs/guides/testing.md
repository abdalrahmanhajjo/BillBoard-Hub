# Testing strategy

## Current quality gates

The repository currently provides static validation and production compilation:

```bash
pnpm quality
pnpm audit --prod
pnpm peers check
pnpm build
```

There is not yet an automated unit, integration, or browser test suite. This is a production gap,
not an indication that those checks are unnecessary.

## Required test layers

### Unit tests

Prioritize pure business logic:

- Inclusive booking-day calculation
- Service fee and VAT rounding
- Static and digital reservation capacity
- Schedule overlap boundaries
- Rotation duration and ordering
- Public projection redaction
- Permission mapping

### Service integration tests

Run against an isolated MongoDB database:

- Booking creation and owner scoping
- Concurrent approval conflict behavior
- Creative ownership and moderation
- Playlist reference validation
- Schedule overlap detection
- Impression reference-chain validation

Each test must create and clean its own data. Never target a shared or production database.

### API contract tests

For every endpoint, cover:

- Success envelope and status
- Missing session
- Insufficient permission
- Invalid JSON
- Contract validation failure
- Missing/malformed id
- Ownership violation
- Conflict response

### Browser tests

Critical journeys:

1. Guest browses and filters billboards.
2. Advertiser registers and signs in.
3. Advertiser submits a reservation.
4. Advertiser sees and cancels an owned reservation.
5. Admin approves or rejects a request.
6. Advertiser uploads a creative.
7. Admin moderates a creative, builds a playlist, and schedules it.
8. Digital playback resolves now-playing and records an impression.

Run browser tests at mobile and desktop viewports and include keyboard navigation.

## Reservation conflict matrix

| Existing                   | Requested       | Static expected  | Digital expected           |
| -------------------------- | --------------- | ---------------- | -------------------------- |
| No overlap                 | Any valid range | Allowed          | Allowed                    |
| Pending overlap            | Same range      | Allowed          | Allowed                    |
| Approved overlap           | Same range      | Conflict         | Allowed until capacity six |
| Approved touching next day | Non-overlap     | Allowed          | Allowed                    |
| Cancelled overlap          | Same range      | Allowed          | Allowed                    |
| Past start                 | Any             | Validation error | Validation error           |

Approval must rerun conflict detection because multiple pending requests can coexist.

## Manual smoke test

Before release:

```bash
curl -sS http://localhost:3000/api/v1/public/billboards
curl -sS http://localhost:3000/api/auth/session
```

Then verify authenticated flows with a dedicated test account and cookie jar. Postman collections
in `docs/` cover the billboard inventory and public catalog.

## Test data rules

- Use clearly synthetic names and emails.
- Do not copy production personal or financial information.
- Use dates sufficiently in the future.
- Generate unique billboard codes per run.
- Clean uploaded assets and MongoDB records after the suite.
