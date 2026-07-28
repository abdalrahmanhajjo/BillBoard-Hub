# Boardly project documentation

Last verified: 2026-07-27

This document is the implementation-accurate project overview for developer handover. It follows
the product documentation structure requested by the project owner while describing the current
Next.js 16 App Router codebase. Where a capability is planned but not implemented, it is marked
explicitly.

## 1. Project overview

| Item           | Current implementation                                    |
| -------------- | --------------------------------------------------------- |
| Project name   | Boardly / BillBoard Hub                                   |
| Framework      | Next.js 16.2.12, App Router                               |
| UI runtime     | React 19.2                                                |
| Language       | TypeScript with strict mode                               |
| Styling        | Tailwind CSS 4 and customized shadcn/Base UI primitives   |
| Animation      | Motion for React (`motion/react`)                         |
| Database       | MongoDB with Mongoose; Auth.js uses the MongoDB adapter   |
| Authentication | Auth.js 5 beta.32, credentials provider, JWT sessions     |
| Media          | Local public assets and optional ImageKit direct uploads  |
| Primary market | Advertisers, agencies, and billboard operators in Lebanon |

Boardly is a public billboard marketplace plus an authenticated operations workspace. Visitors can
browse Lebanese billboard inventory and inspect locations, prices, monthly traffic, media, and
digital specifications. Advertisers can submit reservation requests. Administrators manage
inventory, booking status, creatives, playlists, schedules, playback, and impression records.

The project goals are:

- make billboard inventory discoverable through search-friendly public pages;
- replace unstructured booking requests with validated reservations and conflict detection;
- provide clear, responsive campaign planning and inventory workflows;
- keep authorization, scheduling, and pricing rules outside UI components;
- maintain reusable, typed feature boundaries; and
- support gradual growth from one Next.js deployment without coupling every feature together.

The application is a modular monolith. UI, route handlers, services, and persistence deploy
together, while module boundaries keep business logic independent.

## 2. Folder structure

The project uses the App Router. It does not use an `/app/pages` directory or the legacy Pages
Router structure.

```text
.
├── docs/                              # Handover, architecture, API, SEO, operations
├── public/                            # Local optimized images and public assets
├── src/
│   ├── app/                           # Thin routes, layouts, metadata and API handlers
│   │   ├── (guest)/                   # Login, registration and password-recovery routes
│   │   ├── (public)/                  # Homepage, catalog, blog and marketing content
│   │   ├── api/                       # Auth.js and versioned JSON API handlers
│   │   └── dashboard/                 # Role-protected admin/advertiser routes
│   ├── auth.ts                        # Thin Auth.js facade
│   ├── proxy.ts                       # Edge-compatible coarse route protection
│   ├── client/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── billboards/
│   │   │   ├── blog/
│   │   │   ├── bookings/
│   │   │   ├── creatives/
│   │   │   ├── dashboard/
│   │   │   ├── home/
│   │   │   ├── impressions/
│   │   │   ├── playlists/
│   │   │   ├── public-catalog/
│   │   │   ├── rotation/
│   │   │   ├── schedules/
│   │   │   └── uploads/
│   │   └── ui/
│   │       ├── components/ui/         # Customized shadcn/Base UI primitives
│   │       └── lib/                   # Shared browser utilities and API response handling
│   ├── server/
│   │   ├── db/                        # Mongoose and MongoDB adapter clients
│   │   ├── http/                      # API envelopes, controller errors and HTTP helpers
│   │   └── modules/                   # Controllers, services, repositories, models, actions
│   └── shared/
│       ├── constants/                 # Status, role and permission values
│       ├── contracts/                 # Shared Zod validation contracts
│       ├── policies/                  # Authorization rules
│       ├── pricing/                   # Booking price calculations
│       ├── seo/                       # Metadata and JSON-LD builders
│       ├── types/                     # Cross-layer TypeScript domain types
│       └── utils/                     # Cross-feature pure utilities
├── .env.example                       # Safe environment template
├── package.json                       # Scripts and dependencies
├── pnpm-lock.yaml                     # Reproducible dependency graph
└── pnpm-workspace.yaml                # pnpm native builds and security overrides
```

Feature code belongs under `src/client/features/<feature>`. App Router files compose feature pages
and should not contain feature business logic. Server modules own controllers, services,
repositories, actions, models, and module-only types.

## 3. Rendering strategy by route

Next.js App Router rendering is selected through Server/Client Component boundaries, dynamic
request APIs, caching, `revalidate`, and route configuration. Legacy `getStaticProps`,
`getStaticPaths`, and `getServerSideProps` are not used.

| Route or component                         | Current strategy                                          | Reason                                                                                                                           |
| ------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Homepage `/`                               | Dynamic server render with cached inventory data          | The shared public layout reads the Auth.js session for logged-in navigation. Homepage inventory uses a five-minute server cache. |
| Marketing pages                            | Dynamic server render with static content modules         | The content is stable, but the session-aware public layout makes the route dynamic.                                              |
| Blog index and articles                    | Server-rendered; article slugs are statically enumerated  | Articles currently live in a typed data module. The public layout still makes the final route dynamic.                           |
| Billboard catalog                          | Dynamic Server Component plus client filtering            | Inventory comes from MongoDB; search controls, sorting, drawers, and pagination are interactive.                                 |
| Billboard detail                           | Forced dynamic server render                              | Availability and media specifications must reflect current inventory.                                                            |
| Reservation checkout                       | Forced dynamic server render plus interactive client form | Requires current inventory, authenticated viewer state, date selection, uploads, and submission.                                 |
| Dashboard and user routes                  | Dynamic server render                                     | Session, role, and current operational data are request-specific.                                                                |
| API routes                                 | Dynamic route handlers                                    | They validate live requests and delegate to controllers/services.                                                                |
| Sitemap                                    | ISR-style metadata route, revalidated hourly              | Inventory/content URLs can change without requiring a full redeploy.                                                             |
| Robots and manifest                        | Static metadata routes                                    | Their output rarely changes.                                                                                                     |
| Filters, calendars, drawers, media players | Client Components                                         | They require state, effects, event handlers, or browser APIs.                                                                    |

Most components remain Server Components by default. `use client` is applied at interactive
boundaries; client files do not import database, Node-only, or server module code.

Potential optimization: split static marketing routes from the session-aware public layout, then
hydrate only the account control. This requires an explicit product decision because it changes
when logged-in navigation becomes available.

## 4. SEO and metadata strategy

The project uses the App Router Metadata API:

- static `metadata` exports for stable routes;
- `generateMetadata` for billboard and blog routes;
- canonical URLs generated from the configured site origin;
- Open Graph and Twitter large-image metadata;
- route-specific titles and descriptions;
- `robots.ts`, `sitemap.ts`, and `manifest.ts`; and
- reusable JSON-LD rendered through the `JsonLd` component.

Implemented structured data includes:

- Organization
- WebSite
- BreadcrumbList
- Product/billboard listings
- Service
- Article/BlogPosting
- FAQPage
- general content pages

The project does not use `next/head`. It also does not use Pages Router data functions such as
`getStaticProps` or `getServerSideProps`.

SEO configuration is centralized under:

```text
src/shared/seo/site.ts
src/shared/seo/metadata.ts
src/shared/seo/schema.ts
src/client/ui/components/seo/json-ld.tsx
```

Keyword maps, content planning, competitor research, schema notes, and the prioritized roadmap are
in [SEO documentation](seo/README.md).

## 5. Component guidelines

- Prefer an existing shadcn/Base UI primitive for controls, sheets, drawers, accordions, cards,
  labels, inputs, and selects.
- Customize primitives through props and Tailwind classes without copying their internal behavior
  into feature components.
- Keep route files thin and compose feature pages from `src/client/features`.
- Define component props with explicit TypeScript types.
- Pass content and records as props rather than importing data inside presentation components.
- Keep database and permission rules out of JSX.
- Extract shared code only after it has at least two real consumers.
- Keep form validation in shared Zod contracts when the server and client use the same payload.
- Keep effects for external synchronization, subscriptions, timers, or requests; do not derive
  renderable data through effects.
- Respect reduced-motion preferences for non-essential animation.
- Do not add a broad `use client` boundary for one interactive child.

Large active components are tracked in the
[code cleanliness audit](code-quality/README.md#remaining-refactor-candidates). They should be
split with characterization tests, not through visual rewrites.

## 6. Data layer

Homepage static content is defined in:

```text
src/client/features/home/data/homepage.ts
```

It includes:

- hero content;
- trusted brand names;
- how-it-works steps;
- billboard formats;
- statistics definitions;
- feature/service descriptions;
- FAQs;
- testimonials;
- navigation/footer data; and
- contact details.

`build-home-data.ts` combines this stable content with public billboard records from MongoDB.
Homepage inventory loading is owned by the billboard module action and cached for five minutes.

Application data follows this flow:

```text
Route or Server Component
  → module service
    → repository
      → Mongoose/MongoDB
```

Browser mutations and interactive queries follow:

```text
Feature component or hook
  → feature client service
    → shared apiRequest boundary
      → /api/v1 route handler
        → controller
          → service
            → repository
```

Reservation terminology: the UI calls the workflow a reservation, while MongoDB persists it as a
`Booking` in the `bookings` collection.

See [Data model](architecture/data-model.md) for collections, indexes, relationships, and UTC
timestamp rules.

## 7. Animations

The project imports Motion from `motion/react`. Reusable homepage animation configuration lives in:

```text
src/client/features/home/lib/animations.ts
```

Current shared primitives are:

- `EASE_OUT`
- `fadeUp`
- `scaleIn`
- `staggerContainer`
- `viewportOnce`

Unused variants such as `fadeIn`, `slideLeft`, and `slideRight` were removed during the cleanliness
audit. Add a variant only when it has a real consumer.

Motion is used for:

- viewport entrance transitions;
- staggered cards and steps;
- image/media transitions;
- expandable FAQ content;
- navigation state changes;
- hover/focus feedback; and
- animated counters.

Animations should remain subtle, avoid layout thrashing, and honor `useReducedMotion`. Decorative
motion must never block reading, navigation, or form submission.

## 8. Code quality and cleanliness

The repository provides one aggregate static quality gate:

```bash
corepack pnpm quality
```

It runs:

- TypeScript without emission;
- ESLint;
- Prettier verification;
- Knip unused file/export/dependency analysis; and
- jscpd duplicate-code detection.

Production validation:

```bash
corepack pnpm audit --prod
corepack pnpm peers check
corepack pnpm build
```

Current verified results:

- zero TypeScript and ESLint errors;
- zero formatting failures;
- zero Knip findings;
- zero exact duplicate blocks at the configured threshold;
- zero production dependency advisories;
- zero peer-dependency issues; and
- successful Next.js 16.2.12 production build.

The project does not yet contain automated unit, integration, or end-to-end tests. This is the
largest remaining quality gap. Booking pricing/conflicts, policies, repositories, reservation
submission, and primary mobile workflows should be covered first.

Full findings and the P1/P2/P3 refactor plan are in the
[code cleanliness audit](code-quality/README.md).

## 9. Responsive design

The implementation is mobile-first and uses responsive Tailwind utilities. Target review widths
are:

- 320px
- 375px
- 430px
- 768px
- 1024px
- 1280px
- 1440px
- 1920px

The catalog switches from compact mobile inventory rows and bottom filter access to wider desktop
cards and side filters. Reservation and billboard-detail layouts collapse into single-column
flows. Sheets and drawers use the shared accessible UI primitives.

These widths are design targets, not an automated test claim. Before release, verify them in a
real browser and add Playwright screenshot tests for the homepage, catalog, details, reservation,
login, and dashboard inventory routes. Test long Lebanese location names, empty inventory, server
errors, and large text scaling as well as happy paths.

Horizontal overflow is not allowed. New components should use `min-w-0`, wrapping, responsive
grids, and bounded media containers where appropriate.

## 10. Storage and assets

Assets have two supported sources:

1. Local public assets under `public/`, referenced with root-relative URLs.
2. ImageKit-hosted billboard and creative assets uploaded with short-lived signed parameters.

ImageKit private keys remain server-side. The browser requests temporary authentication parameters
from `/api/v1/uploads/imagekit-auth` and uploads directly to ImageKit.

Stable website and catalog imagery should use `next/image` with:

- accurate alt text;
- a fixed width/height or a positioned `fill` container;
- the correct aspect ratio;
- `sizes` for responsive layouts; and
- `object-fit`/`object-position` selected for the placement.

Nine raw image elements remain in dynamic creative playback and authenticated preview surfaces.
Some are intentional for blob or arbitrary media previews. Stable billboard displays should be
migrated to `next/image` in a focused performance change.

Supabase Storage is not part of the current implementation. Private asset delivery through signed
read URLs is also not implemented; ImageKit upload authentication only protects the upload
credential flow.

## 11. Cron jobs and automation

No cron job or background worker is currently implemented.

Future scheduled work may include:

- inventory synchronization;
- reservation-expiry reminders;
- campaign start/end notifications;
- media validation;
- stale draft cleanup; and
- analytics aggregation.

Implement scheduled work as authenticated server jobs or platform cron invocations that call a
server-only service. Requirements:

- store timestamps in UTC;
- make every job idempotent;
- validate a dedicated secret or platform signature;
- keep service keys out of client bundles;
- use repositories for database access;
- record start, completion, failure, and affected record counts; and
- document retry and rollback behavior.

Automated image uploads should not run as a generic cron task unless there is a defined source and
idempotency key.

## 12. Tracking and analytics

Optional Google Tag Manager and GA4 support is implemented through:

```text
src/client/features/analytics/components/analytics-scripts.tsx
src/client/features/analytics/lib/track-event.ts
```

Environment variables:

```bash
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
GOOGLE_SITE_VERIFICATION=
```

GTM takes precedence when both GTM and direct GA4 IDs are configured. Reservation submission emits
a conversion event. Do not send billing details, email addresses, phone numbers, campaign briefs,
or other personal data in analytics parameters.

Search Console verification metadata is rendered when `GOOGLE_SITE_VERIFICATION` is configured.
Connecting the property, submitting the sitemap, configuring GA4 conversions, and creating an
external KPI dashboard are deployment/account tasks and cannot be inferred from repository code.

Recommended KPIs:

- organic sessions and impressions;
- non-brand query position;
- catalog-to-detail click-through;
- detail-to-reservation conversion;
- completed reservation requests;
- error rate;
- Core Web Vitals; and
- revenue or approved-booking value where consent and privacy rules permit it.

## 13. Documentation maintenance

Canonical documentation starts at [docs/README.md](README.md).

Update documentation in the same change when modifying:

- an API route or response;
- an environment variable;
- a collection, index, or relationship;
- a permission or role rule;
- reservation pricing or scheduling behavior;
- a rendering/caching strategy;
- analytics events;
- deployment requirements; or
- a known limitation.

Use JSDoc for exported business rules, shared utilities, non-obvious contracts, authorization
expectations, and UTC/range semantics. Do not add repetitive comments to every component. Clear
names and small typed props are preferred to comments that merely describe JSX.

Primary documents:

- [Developer handover](HANDOVER.md)
- [Architecture overview](architecture/overview.md)
- [Frontend architecture](architecture/frontend.md)
- [Data model](architecture/data-model.md)
- [API reference](reference/api.md)
- [Configuration](reference/configuration.md)
- [Authentication and authorization](security/authentication-and-authorization.md)
- [Development guide](guides/development.md)
- [Testing strategy](guides/testing.md)
- [User message guidelines](guides/user-messages.md)
- [Payment operations](guides/payments.md)
- [Deployment guide](guides/deployment.md)
- [Operations runbook](operations/runbook.md)
- [Known limitations](known-limitations.md)
- [Code cleanliness audit](code-quality/README.md)
- [SEO documentation](seo/README.md)

## 14. Deployment notes

Required runtime capabilities:

- Node.js 20.9 or newer;
- MongoDB connectivity;
- persistent environment variables/secrets;
- native Sharp support for Next.js image optimization; and
- outbound HTTPS access to ImageKit when uploads are enabled.
- outbound HTTPS access to Stripe when card payments are enabled.

Install and validate:

```bash
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm quality
corepack pnpm audit --prod
corepack pnpm peers check
corepack pnpm build
```

Run a production build:

```bash
corepack pnpm start
```

The project can be deployed to Vercel or another Node.js platform with full Next.js 16 App Router
support. Netlify or other adapters must be verified against dynamic routes, Auth.js, MongoDB,
metadata routes, image optimization, and native dependencies before being declared supported.

Required production configuration includes:

- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_SITE_URL`
- token lifetime and bcrypt settings
- ImageKit keys/endpoint when uploads are enabled
- Stripe secret and webhook signing keys when card payments are enabled
- analytics and verification IDs when tracking is enabled

Use preview deployments with isolated secrets and non-production data. Never point an untrusted
preview deployment at the production database.

Before release:

1. run the complete validation command set;
2. test login, catalog, details, reservation, payment, refund, uploads, admin inventory, and
   booking status;
3. verify mobile layouts and accessibility;
4. verify `/robots.txt`, `/sitemap.xml`, canonical URLs, and social previews;
5. verify MongoDB indexes and backups;
6. verify analytics without personal data; and
7. follow the [release checklist](operations/release-checklist.md).
