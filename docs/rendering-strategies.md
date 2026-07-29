# Rendering Strategies by Feature

> How each route in BillBoard Hub is rendered. Framework: **Next.js 16.2.12 (App Router)**.
> "Strategy" here means the combination of _where_ the HTML is produced (build vs. request
> vs. browser) and _how_ its data is cached.

## Legend

| Term                 | Meaning                                                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Static (SSG)**     | Prerendered to HTML at build time; no per-request work.                                                                                |
| **ISR / cached**     | Server-rendered but the result (or its data) is cached and revalidated on an interval.                                                 |
| **Dynamic SSR**      | Rendered on the server **per request** (`export const dynamic = 'force-dynamic'`, or a dynamic API like `auth()`/`cookies()` is read). |
| **CSR**              | Server sends a thin shell; the real UI + data fetching happen in the browser (`'use client'` + API calls).                             |
| **Server Component** | Runs only on the server, no JS shipped for it.                                                                                         |
| **Client Component** | `'use client'`; hydrated and interactive in the browser.                                                                               |

---

## Architecture in one line

App Router files in `src/app` stay **thin** — each `page.tsx` is a server entry that composes a
feature page from `src/client/features/*`. The rendering strategy of a route is therefore decided
in two places: the **route file** (segment config + server data fetch) and the **feature page**
it renders (`'use client'` or not).

---

## Public marketing & content (`src/app/(public)`)

Shared layout: [`(public)/layout.tsx`](<../src/app/(public)/layout.tsx>) — a Server Component that
awaits `auth()` to personalize the navbar.

> ⚠️ **Segment-wide caveat.** Because this layout reads the session via `auth()` (which reads
> cookies — a dynamic API), Next opts the **entire `(public)` segment into dynamic rendering at
> request time**. So the "static" content pages below are authored as build-time-static (no
> per-request data), but in practice are re-rendered per request under this layout. To actually
> serve them as static HTML you'd need to move the session read out of the shared layout (e.g. into
> the navbar as a separate dynamic slot / PPR boundary).

| Route                                                                                                                                                                         | Boundary                                             | Intended strategy                            | Data & caching                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/` — [home](<../src/app/(public)/page.tsx>)                                                                                                                                  | Server page → `HomePage` (server)                    | **ISR-style cached**                         | `getHomepageInventory()` wraps `listPublic()` in `unstable_cache` (`revalidate: 300s`, tags `billboards`, `homepage-inventory`); fails closed to `[]`. |
| `/about`, `/careers`, `/contact`, `/help`, `/guides`, `/press`, `/partners`, `/media-kit`, `/case-studies`, `/cookies`, `/privacy`, `/terms`, `/blog` (index), `/solutions/*` | Server page → `ContentPage` (server)                 | **Static (SSG)**                             | No data fetch — rendered from local `PAGES` / `CONTENT_SEO` constants.                                                                                 |
| `/blog/[slug]` — [post](<../src/app/(public)/blog/[slug]/page.tsx>)                                                                                                           | Server page → `BlogPostPage` (server)                | **Static (SSG), pre-generated**              | `generateStaticParams()` emits one static page per entry in `BLOG_POSTS`; content is local data.                                                       |
| `/billboards` — [browse](<../src/app/(public)/billboards/page.tsx>)                                                                                                           | Server page → `BrowseBillboardsPage` (**client**)    | **Dynamic SSR** (`force-dynamic`)            | Server reads live `billboardService.listPublic()`, passes to a client page that does filtering/search in-browser.                                      |
| `/billboards/[billboardId]` — [details](<../src/app/(public)/billboards/[billboardId]/page.tsx>)                                                                              | Server page → `BillboardDetailsPage` (server)        | **Dynamic SSR** (`force-dynamic`)            | Live `getPublicById` + digital spec + related; `React.cache()` dedupes the DB read between `generateMetadata` and the page. Emits JSON-LD.             |
| `/billboards/[billboardId]/reservation` — [checkout](<../src/app/(public)/billboards/[billboardId]/reservation/page.tsx>)                                                     | Server page → `ReservationCheckoutPage` (**client**) | **Dynamic SSR** (`force-dynamic`), `noindex` | Depends on live inventory **and** `auth()` session; the interactive checkout runs client-side.                                                         |

**Why these choices:** inventory changes over time and detail/reservation views must reflect live
availability → `force-dynamic`. Marketing/legal/blog content is fixed at build → static. The
homepage wants freshness without a DB hit per anonymous view → cached data with a 5-minute window.

---

## Auth / guest (`src/app/(guest)`)

Shared layout: [`(guest)/layout.tsx`](<../src/app/(guest)/layout.tsx>) — awaits `auth()` and
redirects logged-in advertisers to `/` and admins to `/user/admin/dashboard`.

| Route                                     | Boundary                                              | Strategy                                               | Notes                                                                                                                                           |
| ----------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `/login`, `/register`, `/forgot-password` | Server page → feature page (server) → **client form** | **Dynamic SSR** (layout reads `auth()`) + **CSR form** | Page shells are static markup; the actual auth interaction lives in client `*-form` components. Metadata is `PRIVATE_ROUTE_METADATA` (noindex). |

---

## Dashboard (`src/app/user`)

All dashboard layouts are **auth gates** — Server Components that await `auth()` and `redirect()`:

- [`user/layout.tsx`](../src/app/user/layout.tsx) — must be signed in and active.
- [`user/admin/layout.tsx`](../src/app/user/admin/layout.tsx) — must be `ADMIN`, else `/unauthorized`.
- [`user/advertiser/layout.tsx`](../src/app/user/advertiser/layout.tsx) — must be `ADVERTISER`, else `/unauthorized`.
- [`user/page.tsx`](../src/app/user/page.tsx) — role-based redirect only (no UI).

Because the layout reads the session, **every dashboard route is Dynamic SSR** at the shell level.
Reading `auth()` is the intended second gate (middleware is the first per `AGENTS.md`).

Within that dynamic shell, feature pages split two ways:

| Feature page(s)                                                                                                                                                                                                             | Boundary                                  | Strategy                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `admin` & `advertiser` **landing** dashboards                                                                                                                                                                               | Server component (link cards)             | Dynamic shell, **static content** — just navigation cards.                                       |
| `admin/billboards`, `admin/billboards/create`, `admin/billboards/[id]`, `admin/playlists`, `admin/schedules`, `admin/playback`, `admin/impressions`, `advertiser/billboards`, `advertiser/bookings`, `advertiser/creatives` | **Client** feature pages (`'use client'`) | Dynamic shell + **CSR** — data is fetched in the browser via the API layer (`src/app/api/v1/*`). |

**Why:** dashboards are authenticated, highly interactive, per-user tools. The server's job is to
gate access; the data-heavy management UIs fetch and mutate through the versioned API from the
client, keeping route handlers thin and reusing the service layer.

---

## Errors & system routes (`src/app`)

| Route / file                                                | Boundary                                | Strategy                                             |
| ----------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------- |
| [`error.tsx`](../src/app/error.tsx)                         | **Client** (error boundary requires it) | Client-rendered error UI with `reset()`.             |
| [`not-found.tsx`](../src/app/not-found.tsx)                 | Server                                  | Static 404.                                          |
| [`unauthorized/page.tsx`](../src/app/unauthorized/page.tsx) | Server                                  | Static 403 page (noindex).                           |
| [`layout.tsx`](../src/app/layout.tsx) (root)                | Server                                  | Static shell + global metadata + analytics scripts.  |
| `/payment/success`, `/payment/cancel`                       | Server page → **client result page**    | Dynamic query params + client verification/recovery. |

---

## Metadata routes (`src/app`)

| File                                    | Strategy                      | Notes                                                             |
| --------------------------------------- | ----------------------------- | ----------------------------------------------------------------- |
| [`sitemap.ts`](../src/app/sitemap.ts)   | **ISR** (`revalidate = 3600`) | Static routes + blog posts + live billboards; regenerated hourly. |
| [`robots.ts`](../src/app/robots.ts)     | Static                        | Generated once.                                                   |
| [`manifest.ts`](../src/app/manifest.ts) | Static                        | PWA manifest.                                                     |

---

## API routes (`src/app/api/v1/*`)

Not "rendered" — these are request handlers, **always dynamic per request**. They delegate to
controllers/services (thin handlers per `AGENTS.md`) and are the data source for all CSR dashboard
pages and client feature components.

---

## Summary matrix

| Strategy                                 | Where it's used                                                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Static (SSG)**                         | Content/legal/marketing pages, blog (via `generateStaticParams`), `robots`, `manifest`, `not-found`, `unauthorized` |
| **ISR / cached data**                    | Home (`unstable_cache`, 300s), `sitemap` (3600s)                                                                    |
| **Dynamic SSR (`force-dynamic` / auth)** | `/billboards`, `/billboards/[id]`, reservation, all `(guest)` and all `dashboard` shells                            |
| **CSR (client feature pages)**           | Browse catalog, reservation checkout, and all data-management dashboard pages                                       |
| **Client Components (interactivity)**    | Auth forms, error boundary, catalog filters, dashboard tables/forms                                                 |

_Last generated: 2026-07-28._
