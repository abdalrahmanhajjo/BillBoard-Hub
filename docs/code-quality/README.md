# Code cleanliness audit and refactor plan

Audit date: 2026-07-27

This document records the repository-wide cleanliness audit, the safe corrections made during the
audit, and the remaining refactors that should be delivered in isolated changes. It is intended to
be repeatable: the quality commands described below are now part of `package.json`.

## Executive status

The source tree passes all automated cleanliness gates:

- TypeScript, including an additional strict unused-local and unused-parameter pass
- ESLint with the Next.js Core Web Vitals and React hook rules
- Prettier
- Knip unused-file, unused-export, and unused-dependency analysis
- jscpd exact-duplicate analysis at the project threshold
- pnpm peer-dependency validation
- pnpm production vulnerability audit
- Next.js 16.2.12 production build

The audit removed verified dead code, consolidated repeated request and upload logic, corrected
dependency compatibility and security issues, and preserved application behavior. The main
remaining maintainability risk is a small set of oversized client pages. They are documented below
instead of being split blindly in the same change.

## Scope and inventory

The audit covered every TypeScript, TSX, and CSS source file under `src`.

| Metric                                        | Result |
| --------------------------------------------- | -----: |
| Source files                                  |    329 |
| TypeScript/TSX files                          |    327 |
| Function-like declarations                    |  1,016 |
| Class declarations                            |      6 |
| Variable declarations                         |  1,258 |
| Import declarations                           |  1,103 |
| Hook calls                                    |    253 |
| Exported declarations                         |    521 |
| Explicit client-component files               |     59 |
| Exact duplicate blocks after cleanup          |      0 |
| Knip unused files/exports/dependencies        |      0 |
| Production dependency vulnerabilities         |      0 |
| Existing automated unit/integration/E2E tests |      0 |

The declaration counts are syntax-level inventory metrics, not a claim that every arrow callback
should be documented independently. Every file was checked by the compiler, linter, formatter,
unused-code analyzer, and duplicate analyzer. Files with actionable findings are listed below; all
unlisted source files completed those checks without a file-specific finding.

## Repeatable quality commands

```bash
corepack pnpm quality
corepack pnpm audit --prod
corepack pnpm peers check
corepack pnpm build
```

`pnpm quality` runs TypeScript, ESLint, Prettier, Knip, and jscpd. A new change should not be merged
when any command fails.

For an especially strict unused-symbol check, run:

```bash
corepack pnpm exec tsc --noEmit --noUnusedLocals --noUnusedParameters
```

## Corrected findings

### Dead files and unused exports

Knip initially found 20 unused files. Nineteen were verified orphans and removed, eliminating more
than 1,800 lines of unreachable UI code:

- superseded homepage cards: `feature-card`, `format-card`, `inventory-card`, and `reveal`
- superseded public-catalog detail helpers
- unused generated shadcn primitives: avatar, badge, field, progress, sidebar, skeleton, table,
  tabs, toggle group, toggle, and tooltip
- the unused `use-mobile` hook, which only supported the unused sidebar

The Auth.js repository file was not deleted because the project architecture requires a
module-local repository boundary. Instead, Auth.js adapter construction now lives there and the
auth configuration consumes it.

Unused exports were either made module-private or removed. Canonical shadcn files now expose only
the primitives used by the application. Unused TanStack Query packages were removed rather than
shipping an unconfigured client-state library.

### Browser API response handling

Eight client services previously maintained separate JSON parsers. Seven called `response.json()`
without guarding against HTML, empty, or malformed responses, which could surface the
`Unexpected token '<'` failure pattern.

`src/client/ui/lib/api-client.ts` is now the single browser API boundary. It:

- normalizes success and failure envelopes;
- handles non-JSON and empty responses deterministically;
- converts network failures into a stable user-facing result;
- preserves endpoint-specific payloads in feature services; and
- keeps callers from needing repeated `try/catch` response parsing.

The auth, billboard, booking, creative, playlist, schedule, rotation, and impression client
services all use this boundary.

### Repeated logic

The duplicate-code baseline contained three exact clones. All were removed:

| Original duplication                             | Resolution                                                       |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| Billboard and creative ImageKit upload pipelines | Shared `uploadImageKitAsset` service with small feature wrappers |
| Admin and advertiser dashboard link cards        | Shared `DashboardLinkCard` component                             |
| Billboard form error/success message blocks      | Shared accessible `FormStatusMessages` component                 |

jscpd now reports zero exact clones at 12 lines / 70 tokens.

### Dependencies and security

The dependency audit found:

- MongoDB driver v7 installed against an Auth.js adapter that requires v6;
- Next.js 16.2.10 advisories fixed in later 16.2 releases;
- Auth.js beta.31 advisories fixed in beta.32 through `@auth/core` 0.41.3;
- vulnerable transitive Sharp and PostCSS versions;
- the shadcn CLI incorrectly shipped as a runtime dependency; and
- three unused TanStack packages.

Corrections:

- MongoDB is pinned to compatible v6.21.0.
- Next.js, `@next/env`, and `eslint-config-next` are aligned at 16.2.12.
- Auth.js is updated to beta.32 and the MongoDB adapter to 3.11.3.
- pnpm workspace overrides pin patched Sharp 0.35.3 and PostCSS 8.5.23.
- shadcn is a development dependency.
- unused TanStack dependencies were removed.

After the corrections:

- `pnpm peers check`: no peer issues
- `pnpm audit --prod`: no known vulnerabilities
- `pnpm build`: successful

Keep the Sharp/PostCSS overrides until Next.js declares compatible patched versions directly.
Remove an override only after the production audit and image-optimization build both pass without
it.

### Readability and small performance corrections

- The broken formatter glob was replaced with `prettier --write src` / `prettier --check src`.
- `typecheck`, `check`, dead-code, duplicate, and aggregate `quality` scripts were added.
- FAQ data is passed through the homepage data contract instead of imported inside the component.
- The unused `HomeData.cities` payload was removed.
- Homepage-only constants and internal schema helpers are no longer exported.
- Repeated public-route 404 classification is centralized in
  `src/server/http/is-not-found-error.ts`.
- Dashboard inventory counts use one pass over inventory instead of five separate filters.
- The reservation currency formatter is memoized by currency.
- Initial booking and creative loading reuse their existing loader functions.
- Billboard creation reuses the shared Zod transport contract to strip client-only fields, removing
  an ESLint suppression and applying server-equivalent transforms.

## File finding register

This table lists every source area that had an actionable finding. All other source files passed
the automated audit without a file-specific unused/dead/duplicate finding.

| File or area                                            | Finding                                                                                                                   | State                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` | Broken format script, unused dependencies, peer mismatch, vulnerable transitive packages, missing repeatable quality gate | Corrected                         |
| `src/client/ui/lib/api-client.ts`                       | No shared safe API response boundary                                                                                      | Added                             |
| `src/client/features/*/services/*client.service.ts`     | Repeated and unsafe JSON parsing                                                                                          | Corrected                         |
| Billboard and creative upload services                  | Exact duplicate ImageKit implementation                                                                                   | Corrected                         |
| Dashboard admin/advertiser feature pages                | Exact duplicate link-card component                                                                                       | Corrected                         |
| Billboard create/edit/digital forms                     | Repeated feedback markup; missing live-region semantics                                                                   | Corrected                         |
| Homepage content/types/animation utilities              | Unused exports and an unused data property                                                                                | Corrected                         |
| Homepage FAQ                                            | Reached into the data module instead of accepting props                                                                   | Corrected                         |
| Public billboard and reservation routes                 | Duplicate not-found classification                                                                                        | Corrected                         |
| Auth repository/config                                  | Empty architecture placeholder; adapter reached directly into DB helper                                                   | Corrected                         |
| Booking and rotation utilities                          | Helpers exported despite being module-private                                                                             | Corrected                         |
| Shared contract/type files identified by Knip           | Types or child schemas exported but not consumed outside their module                                                     | Corrected                         |
| Generated shadcn UI directory                           | Twelve unused primitives plus sidebar-only dependencies                                                                   | Removed after import verification |
| Superseded homepage/public-catalog components           | Seven unused component files                                                                                              | Removed after import verification |
| `admin-billboards-page.tsx`                             | Repeated full-array scans for summary counts                                                                              | Corrected                         |
| `reservation-checkout-page.tsx`                         | Recreated `Intl.NumberFormat` during render                                                                               | Corrected                         |

## Remaining refactor candidates

These files are live and were not modified structurally because splitting them safely requires
focused UI and workflow regression tests.

| Priority | File                            | Current size | Recommended boundary                                                                                                                                                                                                                                                   |
| -------- | ------------------------------- | -----------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1       | `reservation-checkout-page.tsx` |  1,222 lines | Keep orchestration in the page; extract selected billboard, campaign dates, campaign brief, creative upload, billing/company, payment/invoice, review, order summary, and confirmation components. Move options to data and submission/upload state to a feature hook. |
| P1       | `browse-billboards-page.tsx`    |    656 lines | Extract catalog toolbar, desktop/mobile filter panels, pagination, and a typed filter-state hook. Move filtering/sorting to a pure tested utility.                                                                                                                     |
| P1       | `admin-billboards-page.tsx`     |    586 lines | Extract inventory metrics, overview/map panels, drawer controller, and inventory query hook.                                                                                                                                                                           |
| P2       | `create-billboard-form.tsx`     |    471 lines | Extract base fields, location/pricing fields, and reusable digital-spec fields while retaining one form owner.                                                                                                                                                         |
| P2       | `billboard-details-page.tsx`    |    501 lines | Extract specification grid, map/context, campaign brief, FAQ, and related inventory sections.                                                                                                                                                                          |
| P2       | `billboard-formats.tsx`         |    357 lines | Separate media playback behavior from format-card presentation.                                                                                                                                                                                                        |
| P2       | `navbar.tsx`                    |    344 lines | Separate desktop navigation, authenticated account menu, and mobile sheet content.                                                                                                                                                                                     |
| P3       | `faq.tsx`                       |    329 lines | Keep the restored design; extract desktop and mobile renderers that share one selection hook.                                                                                                                                                                          |

Refactor one workflow at a time. Add characterization tests first, preserve exported props, and do
not combine these splits with visual redesigns.

## Performance and rendering findings

### Public pages are dynamic

The production build marks most public/marketing routes as dynamic because the shared public
layout reads the Auth.js session to render logged-in navigation. This is correct for session
freshness but prevents otherwise static content pages from being fully prerendered.

Recommended P2 decision:

1. Keep authenticated navigation server-rendered and accept dynamic public pages; or
2. split static marketing routes into a static layout and hydrate only the account control from a
   small client endpoint.

Do not move the whole navbar or layout to a client component merely to obtain a static route. The
chosen trade-off should be recorded in an ADR and verified with the build route table.

### Catalog scaling

Public catalog filtering and pagination currently happen in the browser after loading the public
inventory list. This is simple and responsive for the present data size, but payload and filter
cost grow linearly.

When inventory becomes materially larger, add validated public query parameters, repository-level
filtering, total counts, and server pagination. Keep immediate filter controls client-side while
requesting only the active result window.

### Client boundaries

Only 59 of 327 TypeScript files declare `use client`; no client file imports server modules or
Node-only database packages. Continue putting `use client` at the smallest interactive boundary.

### Images

Nine raw `<img>` elements remain with explicit lint suppressions. They are concentrated in dynamic
creative playback, upload previews, and authenticated inventory previews. Raw elements are
reasonable for blob/video-adjacent previews, but stable billboard images should migrate to
`next/image` with explicit `sizes` and aspect-ratio containers.

The image configuration currently accepts any HTTPS image host for admin-supplied inventory.
Restrict `remotePatterns` to the production ImageKit/CDN hostname once legacy external image URLs
have been migrated; tightening it immediately could break existing database records.

## Hooks and side effects

- ESLint reports no conditional hooks or dependency-array violations.
- Search requests use a debounce and stale-result guard.
- Long-lived window listeners are cleaned up.
- Playback intervals are cleared on dependency changes/unmount.
- Delete/archive/cancel actions use native `window.confirm`. Replace these with one accessible
  shadcn confirmation dialog in a separate UX change; do not silently remove confirmation.
- `console.error` remains only in server controller error normalization. It should eventually be
  replaced with structured logging and request correlation, not deleted.

## Documentation and comment standard

Use comments for intent, invariants, security boundaries, and non-obvious trade-offs. Do not narrate
straightforward JSX or restate a function name.

Use JSDoc for:

- exported business rules and shared utilities;
- public contracts where a field has a non-obvious invariant;
- server actions or service methods with authorization or transaction expectations; and
- time/scheduling behavior where UTC and inclusive/exclusive ranges matter.

Avoid mandatory comments on every component. Descriptive names, small props, and extracted pure
functions are preferable to comment-heavy JSX.

## Test gap

There are currently no committed unit, integration, or end-to-end test files. The compiler and
production build are useful, but they do not verify booking conflicts, authorization, or user
workflows.

P1 testing sequence:

1. Add Vitest for pricing, availability, booking concurrency, schedule state, and response parsing.
2. Add repository/service integration tests against an isolated MongoDB database.
3. Add React Testing Library tests for filters, date selection, form errors, and confirmation
   states.
4. Add Playwright smoke tests for login, catalog filtering, reservation submission, admin approval,
   billboard creation, and mobile navigation.
5. Make `pnpm quality`, unit tests, and the production build required in CI.

## Architecture compliance backlog

App route handlers are thin and database access remains behind repositories. No client component
imports server-only or database modules.

The repository guideline requires an `actions` directory and module-local `*.types.ts` and
repository files for every server module. Several existing modules predate that rule:

- auth has no actions directory or module types file;
- booking, creative, impression, playlist, schedule, and user modules have no actions directory;
- rotation and upload modules do not have the full required module file set.

Do not add empty files only to satisfy a shape check. Add real action boundaries when those
features expose server actions, or amend the guideline if actions are optional for API-only
modules.

## Prioritized plan

### P1 — protection and regression safety

- Add the test layers above, starting with booking conflict/pricing and auth authorization.
- Split the reservation checkout after characterization tests.
- Split and pure-test public catalog filtering.
- Replace placeholder dashboard routes or remove their navigation links until implemented.
- Add CI that runs `pnpm quality`, `pnpm audit --prod`, tests, and `pnpm build`.

### P2 — scalability and bundle control

- Split the admin inventory page and create form.
- Decide static marketing versus session-aware navigation architecture.
- Add server pagination/filtering when inventory size warrants it.
- Migrate stable raw images to `next/image`.
- Add a bundle analyzer and record bundle budgets for public catalog and reservation routes.

### P3 — consistency

- Extract navbar and FAQ desktop/mobile renderers without changing their current design.
- Replace native confirmation dialogs with one accessible shared confirmation component.
- Introduce structured server logging.
- Tighten the ImageKit/CDN remote image allowlist after data migration.

## Merge checklist

- [ ] `corepack pnpm quality` passes.
- [ ] `corepack pnpm audit --prod` reports no known vulnerabilities.
- [ ] `corepack pnpm peers check` reports no peer issues.
- [ ] Tests covering changed business behavior pass.
- [ ] `corepack pnpm build` passes.
- [ ] No new raw `<img>` exception is added without a documented reason.
- [ ] No broad `use client` boundary is introduced for a small interaction.
- [ ] API handlers remain thin and database calls remain in repositories.
- [ ] New shared logic is proven to have at least two consumers.
- [ ] Contracts, routes, permissions, environment variables, and known limitations are documented
      in the same change.
