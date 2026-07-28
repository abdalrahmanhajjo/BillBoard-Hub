# Next.js SEO implementation checklist

## Global

- [x] Set `metadataBase` from the canonical site URL
- [x] Add title template, default description, Open Graph, and Twitter metadata
- [x] Add Search Console verification configuration
- [x] Add `robots.ts`
- [x] Add dynamic `sitemap.ts`
- [x] Add `manifest.ts`
- [x] Add Organization and WebSite JSON-LD
- [x] Add optional GA4/GTM without double loading
- [ ] Supply production analytics and verification values
- [ ] Validate the production social image at 1200 × 630

## Public pages

- [x] Unique keyword-focused titles
- [x] Unique descriptions
- [x] Self-canonicals
- [x] Open Graph and Twitter cards
- [x] One H1 and logical H2 structure
- [x] Breadcrumb and page/service schema
- [x] Descriptive links and image alt text
- [ ] Replace unsupported placeholder statistics and testimonials with verified data

## Dynamic inventory

- [x] Metadata from the database
- [x] Request deduplication between metadata and page
- [x] Product/Offer and Breadcrumb schema
- [x] Dynamic social image from listing media
- [x] Listing URLs in sitemap
- [x] Image sitemap entries
- [x] Real 404 for invalid ids
- [ ] Introduce stable human-readable slugs with redirects from ObjectId URLs
- [ ] Add database updated timestamps to public projection and sitemap

## Blog

- [x] `/blog/[slug]` routes enumerated with `generateStaticParams`
- [ ] Decide whether to move session-aware navigation client-side or adopt partial prerendering for fully static article shells
- [x] Article metadata and social image
- [x] BlogPosting and Breadcrumb schema
- [x] Published and modified dates
- [x] Author and reading time
- [x] Internal conversion links
- [ ] Connect articles to a CMS/repository
- [ ] Add Article sitemap splitting when content volume grows

## Private and duplicate surfaces

- [x] Noindex authentication pages
- [x] Noindex dashboards
- [x] Noindex reservation checkout
- [x] Noindex legal pages
- [x] Noindex free-text search combinations
- [x] Canonical curated format filters

## Performance and quality

- [x] Use Next/Image on public SEO imagery
- [x] Add responsive image `sizes`
- [x] Respect reduced motion
- [x] Cache homepage inventory
- [ ] Restrict remote image hosts
- [ ] Capture production Web Vitals
- [ ] Add Lighthouse performance budgets to CI
- [ ] Add automated metadata and schema tests

## Launch

- [ ] Set `NEXT_PUBLIC_SITE_URL`
- [ ] Set production `NEXTAUTH_URL`
- [ ] Verify Search Console
- [ ] Submit `/sitemap.xml`
- [ ] Test robots and canonicals from the production origin
- [ ] Validate five representative rich-result pages
- [ ] Confirm GA4/GTM page views are not duplicated
- [ ] Confirm the reservation conversion fires exactly once
- [ ] Crawl the site with a crawler that executes JavaScript
- [ ] Monitor coverage, Core Web Vitals, and 404s for four weeks
