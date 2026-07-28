# Frontend architecture and design system

## Composition model

App Router pages under `src/app` are thin Server Components by default. They load server data,
resolve sessions and route parameters, and compose feature pages from `src/client/features`.

Interactive components declare `use client` only where browser state, events, animation, forms, or
client-side data fetching is required.

### Homepage rendering boundary

The homepage combines several strategies rather than forcing the same rendering mode everywhere:

- Marketing copy and section configuration come from the serializable
  `src/client/features/home/data/homepage.ts` content object.
- `src/app/(public)/page.tsx` remains a thin Server Component.
- Public billboard inventory is loaded through
  `server/modules/billboards/actions/get-homepage-inventory.action.ts` and cached for 300 seconds
  with `billboards` and `homepage-inventory` tags.
- The shared public layout resolves the current Auth.js session so the navbar can render the guest
  or authenticated state.
- Search, format reels, filters, counters, carousels, drawers, forms, and Motion interactions
  hydrate only in their client component boundaries.

Homepage content stores icon identifiers rather than React component functions. The UI resolves
them through `home-icon.tsx`, keeping the content payload serializable and replaceable by a CMS or
repository later.

## UI layers

| Layer              | Location                           | Use                                      |
| ------------------ | ---------------------------------- | ---------------------------------------- |
| Route composition  | `src/app`                          | Metadata, params, session, server data   |
| Feature pages      | `src/client/features/*/pages`      | Complete feature screen                  |
| Feature components | `src/client/features/*/components` | Domain-specific UI                       |
| Shared primitives  | `src/client/ui/components/ui`      | Customized shadcn/Base UI components     |
| Shared styling     | `src/app/globals.css`              | Tailwind theme, tokens, global utilities |

Do not move a component into shared UI until at least two real features need it.

## Data fetching

- Public catalog pages load through services in Server Components.
- Browser mutations and authenticated collections use feature client services.
- Feature client services use the shared `apiRequest` boundary for normalized API results. Add a
  client-state library only when a feature has a demonstrated cache/invalidation requirement.
- API clients must handle non-JSON and network failures without throwing unhandled errors.
- Server data remains authoritative after mutations; refresh or invalidate affected queries.

## Forms

- React Hook Form owns field state.
- `@hookform/resolvers/zod` connects shared Zod contracts.
- Inputs use customized shadcn primitives where available.
- Server validation runs again even when the browser already validated.
- Submit buttons expose pending state and prevent duplicate submission.
- Errors are inline, specific, and announced with appropriate ARIA roles.

## Responsive behavior

Primary breakpoints follow Tailwind defaults. Every feature must be reviewed at:

- 320–375 px narrow phone
- 390–430 px modern phone
- 768 px tablet
- 1024–1440 px desktop
- 1600 px wide desktop

Avoid fixed viewport heights on mobile; use `min-h-dvh`. Forms must not produce horizontal scroll,
and tap targets should be at least 44 px where practical.

## Accessibility

- Public layout includes a skip-to-content link.
- Interactive controls require visible focus states.
- Icon-only buttons require accessible names.
- Meaningful images require descriptive alt text; decorative thumbnails use empty alt text.
- Disclosure controls expose `aria-expanded` and `aria-controls`.
- Dynamic status and errors use `role="status"` or `role="alert"`.
- Motion respects `prefers-reduced-motion`.
- Color cannot be the only status indicator.

## Motion

Motion is implemented with `motion/react` and CSS transitions.

Principles:

- Animate `transform` and `opacity` rather than layout properties.
- Keep interface transitions between roughly 150–350 ms.
- Longer ambient animation must remain subtle and non-blocking.
- Never delay access to content for an entrance animation.
- Disable continuous or parallax motion for reduced-motion users.

## Images and media

- Use `next/image` for optimized display.
- Local billboard assets live below `public/images/billboards`.
- Database images may be root-relative local paths or secure HTTPS URLs.
- `next.config.ts` currently permits any HTTPS remote image; production should restrict trusted
  hosts.
- ImageKit direct uploads use server-signed, short-lived credentials.

## Content and metadata

- Root metadata defines the Boardly title template and description.
- Public detail pages generate billboard-specific metadata.
- Marketing copy must not claim real-time booking, payment capture, or guaranteed availability
  unless the backend provides it.
- Public status wording intentionally hides internal availability reasons.

## Component review checklist

- [ ] Uses existing primitive before introducing a new one
- [ ] Has hover, active, focus, disabled, loading, empty, and error states where relevant
- [ ] Works with keyboard only
- [ ] Works on narrow phones without clipping
- [ ] Handles long names, locations, and translated copy
- [ ] Does not expose operational or private fields
- [ ] Respects reduced motion
- [ ] Uses semantic HTML
