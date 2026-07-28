# SEO research and implementation

Research date: 27 July 2026  
Primary market: Lebanon  
Primary buyers: Lebanese brands, regional brands entering Lebanon, media agencies, campaign
planners, and billboard media owners.

## Deliverables

- [SEO strategy and technical audit](seo-strategy.md)
- [Keyword and page map](keyword-map.csv)
- [Competitor and SERP analysis](competitor-analysis.md)
- [Content calendar](content-calendar.csv)
- [Content briefs](content-briefs.md)
- [Schema and analytics guide](schema-and-analytics.md)
- [Implementation checklist](implementation-checklist.md)
- [Prioritized roadmap](roadmap.md)

## Important research limitation

Search engines do not publish reliable keyword volume, keyword difficulty, domain authority, or
backlink counts. The CSV therefore uses directional volume and difficulty bands inferred from
query specificity and the observed July 2026 SERPs. Before committing paid production resources,
replace those bands with exports from Google Keyword Planner and a licensed SEO platform, then
merge actual Search Console queries after the site accumulates data.

Do not present the directional bands as audited traffic forecasts.

## Implemented foundation

- Central Metadata API factory with unique titles, descriptions, canonicals, Open Graph, Twitter,
  keywords, and robots directives
- Dynamic billboard metadata using current database content
- Organization, WebSite, Breadcrumb, FAQ, Product, Service, WebPage, and BlogPosting JSON-LD
- Dynamic XML sitemap with public billboard images and static article routes
- Robots and web-app manifest metadata routes
- Noindex protection for authentication, dashboard, reservation, legal, and error surfaces
- Search Console verification configuration
- Optional GA4 or Google Tag Manager loading without double-tagging
- `reservation_submitted` conversion event
- Four statically generated, indexable blog article routes

The code-level mapping is documented in [SEO strategy](seo-strategy.md).
