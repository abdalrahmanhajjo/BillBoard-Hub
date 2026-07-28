# Technical and on-page SEO strategy

## Audience and conversion model

Primary audience:

- Brand and growth teams buying outdoor media in Lebanon
- Lebanese and regional media agencies
- Businesses evaluating billboard costs and locations
- Media owners evaluating inventory partnerships

Primary organic conversions:

1. Browse billboard inventory
2. View a billboard detail page
3. Start a reservation
4. Submit a reservation request
5. Contact campaign planning
6. Submit a partner inquiry

## Rendering strategy

This project uses the Next.js App Router. Pages Router APIs such as `getStaticProps`,
`getStaticPaths`, `getServerSideProps`, and `next/head` are intentionally not used.

| Surface                            | Strategy                                                      | SEO reason                                                                                |
| ---------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Static marketing pages             | Server Components with static `metadata`                      | Stable crawlable HTML and build-time metadata                                             |
| Blog article routes                | Pre-enumerated static content in a request-aware public shell | Deterministic article content and metadata while the shared navbar resolves session state |
| Homepage inventory                 | Server render plus five-minute data cache                     | Fresh-enough inventory without a database read per visitor                                |
| Billboard listing                  | SSR                                                           | Current inventory and search state                                                        |
| Billboard detail                   | SSR with request memoization                                  | Current price/availability and database-derived metadata                                  |
| Reservation, auth, dashboard       | SSR/CSR and `noindex`                                         | User-specific or transactional content should not rank                                    |
| Filters, accordions, forms, Motion | Client components                                             | Interaction is isolated without hiding core page content                                  |

The shared public layout calls Auth.js so it can render the correct guest or authenticated navbar.
Consequently, the final public route shell is dynamically rendered even when article parameters
and content are statically known. Removing that server session dependency or adopting a supported
partial-prerendering architecture would be required for a fully static route.

## Metadata architecture

`src/shared/seo/metadata.ts` is the canonical metadata factory. It creates:

- Unique title and description
- Absolute canonical URL
- Open Graph metadata
- Twitter large-image card
- Index/follow directives
- Googlebot rich-preview directives
- Keyword hints for editorial governance

Static content metadata is mapped in `src/client/features/content/data/seo.ts`.

Dynamic billboard metadata uses:

- Listing name and city in the title
- Description or a safe generated fallback
- First listing image for social previews
- Format/city long-tail keywords
- Stable self-canonical URL

Filtered search-result pages containing free-text queries are `noindex`. Curated digital and static
format filters remain indexable with self-canonicals.

## Page mapping

| Route                           | Primary keyword                       | Schema                       | Indexing |
| ------------------------------- | ------------------------------------- | ---------------------------- | -------- |
| `/`                             | billboard advertising Lebanon         | Organization, WebSite, FAQ   | Index    |
| `/billboards`                   | billboards Lebanon                    | Organization, WebSite        | Index    |
| `/billboards?type=digital`      | digital billboards Lebanon            | Organization, WebSite        | Index    |
| `/billboards?type=static`       | static billboards Lebanon             | Organization, WebSite        | Index    |
| `/billboards/[billboardId]`     | billboard + city                      | Product, Offer, Breadcrumb   | Index    |
| `/billboards/[id]/reservation`  | reservation transaction               | None                         | Noindex  |
| `/about`                        | billboard marketplace Lebanon         | AboutPage, Breadcrumb        | Index    |
| `/solutions/brands`             | billboard advertising for brands      | Service, WebPage, Breadcrumb | Index    |
| `/solutions/agencies`           | billboard advertising for agencies    | Service, WebPage, Breadcrumb | Index    |
| `/solutions/campaign-planning`  | OOH media planning Lebanon            | Service, WebPage, Breadcrumb | Index    |
| `/solutions/audience-targeting` | OOH audience targeting                | Service, WebPage, Breadcrumb | Index    |
| `/blog`                         | billboard advertising insights        | CollectionPage, Breadcrumb   | Index    |
| `/blog/[slug]`                  | article-specific                      | BlogPosting, Breadcrumb      | Index    |
| `/contact`                      | billboard advertising contact Lebanon | ContactPage, Breadcrumb      | Index    |
| Legal, auth, dashboard          | None                                  | None                         | Noindex  |

## Structured data

Reusable generators live in `src/shared/seo/schema.ts`. JSON is escaped before insertion through
`JsonLd` to prevent a closing-script injection from database content.

Implemented types:

- `Organization`
- `WebSite` with `SearchAction`
- `BreadcrumbList`
- `FAQPage`
- `Product` and `Offer` for billboard inventory
- `Service`
- `WebPage`, `AboutPage`, `CollectionPage`, `ContactPage`
- `BlogPosting`

Schema must describe visible content. Do not add review ratings, events, availability, prices, or
authors that cannot be verified from the page and database.

## Crawl and canonical controls

- `src/app/robots.ts` permits public crawling and blocks API/dashboard paths.
- `src/app/sitemap.ts` includes canonical marketing pages, articles, billboard detail pages, and
  listing images.
- Search query combinations canonicalize to the core inventory route and are noindexed.
- Reservation and user-specific surfaces are noindexed.
- Unknown resources return real `404` responses through `notFound()`.
- The canonical origin is controlled by `NEXT_PUBLIC_SITE_URL`.

## On-page requirements

Every indexable page should have:

- One descriptive H1
- H2 sections that answer related search intent
- Crawlable text above or near the first conversion
- Descriptive internal link anchors
- Descriptive image alt text; decorative thumbnails use empty alt text
- A clear next action relevant to the page intent
- Unique metadata and a self-canonical

Inventory pages should state city, address, format, dimensions, monthly traffic, monthly price, and
availability in visible text when the database provides them.

## Core Web Vitals

Targets at the 75th percentile:

- LCP ≤ 2.5 seconds
- INP ≤ 200 milliseconds
- CLS ≤ 0.1

Current implementation strengths:

- `next/image` on public marketplace and editorial imagery
- Explicit responsive `sizes`
- Server-rendered core content
- Lazy loading outside priority images
- Reduced-motion handling
- Cached homepage inventory

Remaining risks:

- Any-HTTPS remote image allowlist can permit slow or untrusted sources
- Large Motion client boundaries on the homepage
- Some authenticated creative previews still use raw `<img>`
- No field Web Vitals collection or performance budget in CI
- Third-party analytics and media can increase main-thread and network work

P1 performance work:

1. Restrict remote images to the production ImageKit/CDN host.
2. Record Web Vitals by route and device after launch.
3. Test homepage and listing pages with production data.
4. Set image width/height or aspect-ratio placeholders for every user-provided asset.
5. Review client component boundaries and bundle size.

## Internal linking

- Homepage links to inventory, format filters, guides, solutions, contact, and featured listings.
- Each article links to inventory and the most relevant solution page.
- Detail pages link to related inventory and reservation.
- Solution pages link to campaign planning or inventory, not only registration.
- Future city pages should link to nearby cities, relevant formats, and guides.

Avoid producing hundreds of thin city/filter pages. Create a city landing page only when it has
enough active inventory and unique local guidance.

## Sources

- Next.js Metadata API:
  <https://nextjs.org/docs/app/getting-started/metadata-and-og-images>
- Google crawling and indexing:
  <https://developers.google.com/search/docs/crawling-indexing>
- Google canonicals:
  <https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls>
- Google sitemaps:
  <https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview>
- Core Web Vitals: <https://web.dev/articles/vitals>
