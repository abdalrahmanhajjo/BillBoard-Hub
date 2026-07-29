# Developer handover

This document is the shortest complete path for a developer taking ownership of Boardly. It
describes the implemented system rather than the intended product roadmap. Follow the linked
references when changing a contract, permission, collection, or operational dependency.

## 1. Project overview

Boardly is a full-stack billboard marketplace and operations platform focused on Lebanon. It
supports two connected product areas:

- A public marketplace where visitors discover billboard inventory, inspect availability and
  specifications, and authenticated advertisers submit reservation requests.
- An operational workspace where administrators manage billboard inventory, reservation
  approvals, creatives, digital-screen playlists, schedules, playback, and impressions.

The application is a modular monolith: the browser application, Server Components, JSON API,
domain services, and MongoDB persistence layer ship as one Next.js deployment while remaining
separated by module boundaries.

## 2. Technology and tools

| Area                   | Technology                                                      |
| ---------------------- | --------------------------------------------------------------- |
| Runtime and framework  | Node.js 20+, Next.js 16 App Router, React 19                    |
| Language and contracts | TypeScript, Zod                                                 |
| Styling and components | Tailwind CSS 4, customized shadcn/Base UI primitives            |
| Interaction            | Motion, React Hook Form                                         |
| Authentication         | Auth.js 5 credentials provider, JWT sessions, bcrypt            |
| Persistence            | MongoDB, Mongoose, Auth.js MongoDB adapter                      |
| Media                  | Next/Image and optional ImageKit direct uploads                 |
| Package manager        | pnpm through Corepack                                           |
| Quality                | ESLint, Prettier, TypeScript compiler, Next.js production build |

The exact versions are authoritative in `package.json` and `pnpm-lock.yaml`.

## 3. Repository structure

```text
.
├── docs/                         # Architecture, API, security, operations, and guides
├── public/                       # Static images and public assets
├── src/
│   ├── app/                      # Thin App Router pages, layouts, and route handlers
│   ├── auth.ts                   # Thin Auth.js facade
│   ├── proxy.ts                  # Edge-compatible coarse route gate
│   ├── client/
│   │   ├── features/             # Feature-owned pages, components, hooks, services, types
│   │   └── ui/                   # Customized shadcn primitives and shared UI utilities
│   ├── server/
│   │   ├── db/                   # Mongoose and MongoDB adapter connections
│   │   ├── http/                 # API envelopes, session guards, error normalization
│   │   └── modules/              # Controllers, services, repositories, models, actions
│   └── shared/
│       ├── constants/            # Statuses, roles, and permission identifiers
│       ├── contracts/            # Cross-layer Zod contracts
│       ├── policies/             # Authorization and ownership rules
│       ├── pricing/              # Server-authoritative reservation pricing
│       └── types/                # Shared domain/public types
├── .env.example                  # Safe local configuration template
├── AGENTS.md                     # Repository architecture constraints
├── CONTRIBUTING.md               # Change workflow and engineering rules
└── package.json                  # Commands and dependency versions
```

Important entry points:

- `src/app/(public)/page.tsx`: homepage route composition.
- `src/client/features/home`: homepage content, sections, and database-to-view mapping.
- `src/app/api/v1`: product JSON API route handlers.
- `src/server/modules`: domain implementation.
- `src/shared/contracts`: untrusted input validation.
- `src/shared/policies`: authoritative permissions.
- `src/server/http`: consistent API responses and controller errors.

See [Architecture overview](architecture/overview.md) and
[Frontend architecture](architecture/frontend.md) for request and rendering boundaries.

## 4. Local setup

Prerequisites:

- Node.js 20 or newer
- Corepack
- A reachable MongoDB instance
- ImageKit credentials only when testing uploads

```bash
git clone <repository-url>
cd BillBoard-Hub
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

Before diagnosing application code, confirm MongoDB is running and the database named by
`MONGODB_DB_NAME` is reachable from the Next.js process.

## 5. Environment configuration

| Variable                             | Requirement            | Purpose                                      |
| ------------------------------------ | ---------------------- | -------------------------------------------- |
| `MONGODB_URI`                        | Required               | MongoDB server or cluster connection string  |
| `MONGODB_DB_NAME`                    | Required               | Shared Mongoose/Auth.js database name        |
| `AUTH_SECRET`                        | Required               | Auth.js cookie signing and encryption secret |
| `NEXTAUTH_URL`                       | Required in production | Canonical application origin                 |
| `ACCESS_TOKEN_TTL_MS`                | Required               | Opaque access-token metadata lifetime        |
| `REFRESH_TOKEN_TTL_MS`               | Required               | Opaque refresh-token metadata lifetime       |
| `SALT_ROUNDS`                        | Recommended            | bcrypt work factor                           |
| `IMAGEKIT_PRIVATE_KEY`               | Uploads only           | Server-side upload signature key             |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`    | Uploads only           | Browser-safe ImageKit public key             |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`  | Uploads only           | ImageKit delivery endpoint                   |
| `STRIPE_SECRET_KEY`                  | Card payments          | Server-side Stripe API key                   |
| `STRIPE_WEBHOOK_SECRET`              | Card payments          | Stripe webhook signature verification        |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Card payments          | Public key used by Stripe Elements           |

Generate `AUTH_SECRET` with:

```bash
openssl rand -base64 32
```

Never expose `AUTH_SECRET`, `MONGODB_URI`, or `IMAGEKIT_PRIVATE_KEY` through a `NEXT_PUBLIC_*`
variable. The complete rules and examples are in [Configuration](reference/configuration.md).

## 6. Database model

MongoDB is the system of record. Modules use string ids between collections and services validate
cross-collection references.

| Collection                | Purpose                                                                   |
| ------------------------- | ------------------------------------------------------------------------- |
| `users`                   | Credentials, profile, role, and active state                              |
| `billboards`              | Static/digital inventory, location, price, traffic, images, status        |
| `digital_billboard_specs` | Digital-only resolution, brightness, rotation, screen state               |
| `bookings`                | Advertiser reservation requests, dates, pricing, billing, workflow status |
| `creatives`               | Advertiser image/video assets and moderation state                        |
| `playlists`               | Ordered creative sets assigned to digital billboards                      |
| `schedules`               | Non-overlapping playlist windows for digital billboards                   |
| `impressions`             | Recorded creative playback events                                         |
| `payments`                | Stripe/manual payment ledger, attempts, amounts, and reconciliation       |
| `payment_events`          | Idempotency ledger for processed Stripe webhook events                    |

Terminology: a **reservation** in the UI and product workflow is persisted as a `Booking` model in
the `bookings` collection. There is no separate `reservations` collection.

Important indexes include unique billboard codes, booking date windows per billboard, unique
digital specifications per billboard, schedule windows, and time-ordered impression indexes.
Refer to [Data model](architecture/data-model.md) before changing schemas.

The complete approval, Checkout, webhook, offline reconciliation, and refund workflow is in
[Payments](guides/payments.md).

There is currently no migration runner. Prefer additive changes and document every manual
backfill with a rollback procedure.

## 7. Main workflows

### Public discovery

1. Server Components request public-safe billboard projections.
2. The catalog renders only published fields and a simplified availability flag.
3. Search, filters, sort, tabs, and drawers run client-side.
4. Billboard details load current inventory and digital specifications from the server.

The homepage content is a typed, serializable content object under
`src/client/features/home/data/homepage.ts`. Homepage inventory is read from MongoDB through a
tagged five-minute cache. The session-aware navbar keeps the public layout request-aware while
preventing an inventory database read on every anonymous request.

### Reservation request

1. An advertiser selects a billboard and inclusive start/end dates.
2. The client validates the form with the shared booking contract. Digital inventory accepts MP4,
   WebM, or MOV creatives only when their browser-read duration is strictly below 10 seconds; static
   inventory rejects video.
3. `POST /api/v1/bookings` authenticates the actor and delegates to the booking controller.
4. The service verifies the billboard, date range, status, and overlapping capacity.
5. Pricing is recomputed from the current monthly price; client totals are ignored.
6. A `pending` booking record is created.
7. An admin may approve or reject it. Approval repeats the conflict check.
8. The owner or an admin may cancel pending or approved records.

Pending requests do not block calendar capacity. Approved static bookings allow one concurrent
campaign; digital screens currently allow six.

### Digital playback

1. An admin approves creatives.
2. An admin builds a playlist for a digital billboard.
3. A non-overlapping schedule assigns the playlist to a UTC time window.
4. A screen polls the public now-playing endpoint.
5. The device records an impression after playback.
6. Admin analytics aggregate impression records.

Additional rules are documented in [Domain modules](architecture/modules.md).

## 8. API responsibilities

All product endpoints use `/api/v1`; Auth.js protocol endpoints use `/api/auth`.

| Group            | Important routes                                                             | Responsibility                                |
| ---------------- | ---------------------------------------------------------------------------- | --------------------------------------------- |
| Auth             | `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`, `/auth/refresh` | Account and session lifecycle                 |
| Public inventory | `/public/billboards/*`                                                       | Public-safe billboard catalog                 |
| Billboards       | `/billboards/*`                                                              | Internal inventory and digital specifications |
| Reservations     | `/bookings/*`                                                                | Request, list, moderate, and cancel bookings  |
| Creatives        | `/creatives/*`                                                               | Asset metadata and moderation                 |
| Playlists        | `/playlists/*`                                                               | Digital creative ordering                     |
| Schedules        | `/schedules/*`                                                               | Digital campaign windows and rotation preview |
| Screens          | `/public/screens/*`                                                          | Now-playing and impression ingestion          |
| Analytics        | `/impressions`                                                               | Admin impression aggregation                  |
| Uploads          | `/uploads/imagekit-auth`                                                     | Short-lived ImageKit authorization            |

Success responses use `{ "ok": true, "data": ... }`; failures use
`{ "ok": false, "error": "..." }`. The endpoint matrix, payloads, permissions, and conflict
responses are in [API reference](reference/api.md).

## 9. Authentication and authorization

Boardly uses Auth.js credentials authentication and encrypted JWT session cookies.

1. Zod validates credentials.
2. The user is loaded by normalized email.
3. bcrypt verifies the password hash.
4. Inactive users are rejected.
5. JWT/session callbacks expose the server-derived user id, role, and active state.

Authorization is layered:

- `src/proxy.ts` performs only coarse Edge-compatible cookie checks.
- Server layouts enforce dashboard-area access.
- API handlers call `requireSession()`.
- Services call centralized permission and ownership policies.
- Repository filters are scoped by the trusted actor where appropriate.

Roles are `admin` and `advertiser`. Never trust a client-provided role, owner id, price, status, or
permission claim. Full details are in
[Authentication and authorization](security/authentication-and-authorization.md).

## 10. Technical decisions

- **Modular monolith:** keeps deployment simple without mixing domain responsibilities.
- **Thin App Router files:** route handlers extract requests and delegate; pages compose features.
- **Repository-only persistence:** business code does not issue Mongoose queries directly.
- **Shared Zod contracts:** client and server validate the same request shapes.
- **Server-authoritative booking pricing:** prevents price manipulation.
- **Two-stage conflict checks:** request creation provides early feedback; approval protects the
  final calendar state.
- **UTC persistence:** timestamps remain portable; reservation date strings represent inclusive
  calendar days.
- **Public projections:** storefront responses omit operational fields.
- **Serializable homepage content:** copy and icon identifiers can move to a CMS without changing
  section components.
- **Cached homepage inventory:** public inventory is cached for 300 seconds and tagged for future
  on-demand invalidation.
- **Customized shadcn components:** shared interaction and accessibility behavior is retained while
  allowing the product’s visual system.

ADR details are in [ADR-0001](adr/0001-modular-monolith.md).

## 11. Running and validation

Development:

```bash
pnpm dev
```

Required pre-handover checks:

```bash
pnpm quality
pnpm audit --prod
pnpm peers check
pnpm build
```

Production-like local run:

```bash
pnpm build
pnpm start
```

There is not yet an automated unit, integration, or browser suite. Follow the manual smoke tests
and proposed coverage in [Testing strategy](guides/testing.md).

## 12. Deployment

Deploy to a Node.js-capable Next.js platform with outbound MongoDB and ImageKit access.

1. Configure environment-specific secrets.
2. Ensure Mongoose and Auth.js use the same explicit database name.
3. Run all validation commands.
4. Back up MongoDB before schema or data changes.
5. Deploy an immutable build.
6. Verify `/`, `/api/auth/session`, and `/api/v1/public/billboards`.
7. Verify anonymous rejection for one protected endpoint.
8. Smoke-test login, reservation conflicts, and digital scheduling.

Static export is not supported for authenticated and database-backed routes. See
[Deployment guide](guides/deployment.md) and [Release checklist](operations/release-checklist.md).

## 13. Known issues and next work

Do not treat the following as production guarantees:

- Public screen endpoints do not yet authenticate devices or rate-limit ingestion.
- Token TTL parsing lacks startup validation.
- Account deactivation does not immediately revoke an existing JWT session.
- Reservation approval is application-level and can race under simultaneous approvals.
- No automated unit, integration, or end-to-end tests exist.
- There is no migration framework, health endpoint, background job runner, or structured tracing.
- Public and some internal lists lack pagination.
- Visa details are verified in reservation Step 3 with Stripe Elements, and approved reservations
  are charged through Stripe Checkout. Cash/Whish remains manually reconciled.
- Password recovery is a placeholder.
- Playlist creation does not require every creative to be approved.
- Delete operations do not consistently enforce cross-module cascades.
- Admin audit logs and data-retention policies are not implemented.

The maintained, prioritized list is [Known limitations](known-limitations.md). Review it before
every production release.

## 14. Change checklist for the next developer

When adding or changing a feature:

1. Keep the route/page thin.
2. Add or update the shared Zod contract.
3. Put business and permission rules in the module service.
4. Put MongoDB access in the repository.
5. Return errors through shared HTTP helpers.
6. Update the API, data model, security, or operations documentation in the same change.
7. Add tests where infrastructure exists; otherwise record a deterministic smoke test.
8. Run TypeScript, lint, formatting, and the production build.

Read [CONTRIBUTING.md](../CONTRIBUTING.md) before the first change.
