# Prioritized SEO roadmap

## P1 — high impact

| Task                                                                       | Impact | Effort | Owner                 | Acceptance criteria                                                |
| -------------------------------------------------------------------------- | ------ | ------ | --------------------- | ------------------------------------------------------------------ |
| Configure canonical production URL, Search Console, and sitemap            | High   | Low    | Engineering/Marketing | HTTPS property verified; sitemap accepted; no hostname mismatch    |
| Replace placeholder claims, reviews, and statistics with verified evidence | High   | Medium | Product/Legal         | Every public claim has a database or approved source               |
| Publish cost, creative, and Beirut planning guides                         | High   | Medium | Content/OOH expert    | Three reviewed articles live with internal links and schema        |
| Create stable billboard slugs                                              | High   | Medium | Engineering           | Human-readable URLs, unique constraint, 301 redirects from old ids |
| Restrict image hosts and measure field Web Vitals                          | High   | Medium | Engineering           | CDN allowlist; LCP/INP/CLS dashboard by route                      |
| Add automated booking/schema/metadata tests                                | High   | Medium | Engineering           | CI blocks invalid canonicals, schema, and conversion regressions   |
| Resolve reservation approval race                                          | High   | High   | Backend               | Atomic capacity enforcement under concurrent approval tests        |

## P2 — medium impact

| Task                                          | Impact      | Effort | Owner               | Acceptance criteria                                                |
| --------------------------------------------- | ----------- | ------ | ------------------- | ------------------------------------------------------------------ |
| Launch verified Beirut and city landing pages | Medium–high | Medium | SEO/Product         | Only cities with sufficient inventory and unique local copy        |
| Add traffic/reach methodology                 | Medium      | Medium | Data/Content        | Public methodology, update date, known limitations                 |
| Publish verified case studies                 | Medium–high | Medium | Customer success    | Objective, inventory, dates, measurement, client approval          |
| Instrument complete organic funnel            | Medium      | Low    | Analytics           | Select, begin, submit, and contact events visible and deduplicated |
| Add internal-link recommendations in CMS      | Medium      | Medium | Engineering/Content | Orphan pages reported; relevant links suggested                    |
| Add CMS-backed articles                       | Medium      | Medium | Engineering         | Draft/review/publish workflow and stable metadata                  |
| Add image/social asset workflow               | Medium      | Medium | Design/Engineering  | 1200×630 image per major landing page                              |

## P3 — expansion

| Task                                     | Impact              | Effort | Owner               | Acceptance criteria                                     |
| ---------------------------------------- | ------------------- | ------ | ------------------- | ------------------------------------------------------- |
| Validate Arabic and French search demand | Medium              | Medium | SEO                 | Keyword and conversion evidence before localization     |
| Build multilingual architecture          | Medium              | High   | Engineering/Content | Localized URLs, hreflang, translated schema and content |
| Annual Lebanon OOH data report           | Medium–high         | High   | Data/PR             | Linkable original dataset and outreach campaign         |
| Media-owner public profiles              | Medium              | Medium | Partnerships        | Verified profile and inventory relationship             |
| Programmatic DOOH content                | Low until supported | Medium | Product/Content     | Publish only after the product supports the capability  |

## First 30 days

1. Configure production origins, verification, analytics, and consent.
2. Crawl production and fix any canonical, redirect, or indexing conflicts.
3. Validate dynamic billboard Product schema against real records.
4. Replace unverified marketing claims.
5. Publish the cost guide.
6. Begin Web Vitals collection.

## Days 31–90

1. Publish creative and Beirut guides.
2. Implement billboard slugs and redirects.
3. Add conversion-funnel events.
4. Secure the public device endpoints and resolve release blockers.
5. Acquire the first relevant editorial and partner links.
6. Review Search Console queries and update the keyword map with real impressions.
