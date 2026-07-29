# Schema, analytics, and tracking

## Schema implementation

Structured-data generators are in `src/shared/seo/schema.ts`. Render them with
`src/client/ui/components/seo/json-ld.tsx`.

Example:

```tsx
<JsonLd
  data={[
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
    blogPostingSchema({
      title: post.title,
      description: post.description,
      path: `/blog/${post.slug}`,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      author: post.author,
      image: post.image,
    }),
  ]}
/>
```

Validation:

1. Inspect rendered HTML, not only React source.
2. Test representative pages with Google Rich Results Test.
3. Validate JSON-LD with Schema.org Validator.
4. Compare structured price and availability to visible database values.
5. Revalidate after contract or route changes.

FAQ markup does not guarantee an FAQ rich result. Google limits FAQ rich results and may change
eligibility; the markup remains useful when it accurately represents visible content.

## Analytics configuration

Configure one method:

```dotenv
# Preferred when marketing manages multiple tags
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX

# Or direct GA4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

When both are present, Tag Manager takes precedence to prevent duplicate page views.

Search Console verification:

```dotenv
GOOGLE_SITE_VERIFICATION=token-only
```

Set `NEXT_PUBLIC_SITE_URL` to the verified canonical property.

## Event taxonomy

| Event                       | Trigger                          | Parameters                                                   | Conversion |
| --------------------------- | -------------------------------- | ------------------------------------------------------------ | ---------- |
| `view_billboard_list`       | Catalog loaded                   | result_count, filters                                        | No         |
| `select_billboard`          | Listing opened                   | billboard_id, city, type                                     | Micro      |
| `begin_reservation`         | Reservation flow opened          | billboard_id, city, value                                    | Micro      |
| `reservation_submitted`     | API successfully creates booking | booking_reference, billboard_id, city, type, value, currency | Primary    |
| `contact_campaign_planning` | Contact action                   | placement                                                    | Primary    |
| `partner_inquiry`           | Partner action                   | partner_type                                                 | Primary    |
| `creative_uploaded`         | Upload succeeds                  | creative_type                                                | Product    |

`reservation_submitted` is implemented. Add the other events only at stable user actions; do not
fire conversions on page views or failed requests.

Never send:

- Names
- Email addresses
- Phone numbers
- Campaign briefs
- Creative URLs
- MongoDB connection information
- Session/token values

The current booking reference is an internal transaction reference. If analytics policy treats it
as user-linked data, replace it with a random analytics transaction id or omit it.

## GA4 and Search Console setup

1. Create a GA4 web data stream for the canonical HTTPS origin.
2. Configure GTM or direct GA4, not both.
3. Verify Realtime data in a non-production test property first.
4. Mark `reservation_submitted` and qualified contact events as key events.
5. Create Search Console Domain and HTTPS URL-prefix properties.
6. Verify ownership and submit `/sitemap.xml`.
7. Link Search Console to GA4.
8. Filter internal traffic and document consent requirements.

## KPI dashboard

Weekly:

- Organic users and engaged sessions
- Search impressions, clicks, CTR, and average position
- Landing pages and query clusters
- Inventory-detail views from organic
- Reservation starts and submissions from organic
- Organic reservation conversion rate

Monthly:

- Indexed versus submitted URLs
- Non-brand clicks
- Commercial keyword visibility
- New/lost referring domains
- LCP, INP, and CLS by route group and device
- Content-assisted reservation conversions

Source references:

- GA4 setup: <https://support.google.com/analytics/answer/14183469>
- Search Console/GA4 linking: <https://support.google.com/analytics/answer/10737381>
