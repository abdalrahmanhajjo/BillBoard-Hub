# API reference

Base path: `/api/v1`, except Auth.js internals at `/api/auth`.

## Conventions

- Send JSON bodies with `Content-Type: application/json`.
- Authenticated endpoints use the Auth.js session cookie.
- Identifiers are MongoDB ObjectId strings.
- Dates and timestamps use ISO 8601.
- Unknown properties are handled according to the relevant Zod object contract.

Response envelope:

```json
{ "ok": true, "data": {} }
```

```json
{ "ok": false, "error": "Request could not be completed." }
```

## Authorization matrix

| Surface                              |        Public |             Advertiser |                           Admin |
| ------------------------------------ | ------------: | ---------------------: | ------------------------------: |
| Public catalog                       |          Read |                   Read |                            Read |
| Internal billboard inventory         |             — |                   Read |                          Manage |
| Reservations                         |             — | Create/read/cancel own | Create/read/moderate/cancel all |
| Creatives                            |             — |             Manage own |            Read/moderate/delete |
| Playlists and schedules              |             — |                      — |                          Manage |
| Rotation preview                     |             — |                      — |                            Read |
| Now-playing and impression ingestion | Device/public |          Device/public |                  Read analytics |
| ImageKit upload auth                 |             — |                   Read |                            Read |
| Card payments                        |             — |           Own approved |                     Read/refund |
| Offline payment reconciliation       |             — |                      — |                          Manage |

## Auth

| Method     | Path                      | Auth    | Description                            |
| ---------- | ------------------------- | ------- | -------------------------------------- |
| `POST`     | `/auth/register`          | Public  | Register an advertiser                 |
| `POST`     | `/auth/login`             | Public  | Create a session                       |
| `POST`     | `/auth/logout`            | Session | End the session                        |
| `GET`      | `/auth/me`                | Session | Current user and access-token metadata |
| `POST`     | `/auth/refresh`           | Session | Refresh opaque access-token metadata   |
| `GET/POST` | `/api/auth/[...nextauth]` | Varies  | Auth.js protocol endpoints             |

Register body:

```json
{
  "firstName": "Rami",
  "lastName": "Haddad",
  "email": "rami@example.com",
  "password": "correct-horse-battery",
  "confirmPassword": "correct-horse-battery"
}
```

Login body:

```json
{ "email": "rami@example.com", "password": "correct-horse-battery" }
```

## Public billboards

| Method | Path                                            | Description                  |
| ------ | ----------------------------------------------- | ---------------------------- |
| `GET`  | `/public/billboards`                            | List public-safe inventory   |
| `GET`  | `/public/billboards/{billboardId}`              | Get one public billboard     |
| `GET`  | `/public/billboards/{billboardId}/digital-spec` | Public digital specification |

Public billboards expose `isAvailable` instead of the internal status reason and omit code,
creator, timestamps, and operational screen state.

## Internal billboards

| Method   | Path                                     | Permission          | Description                     |
| -------- | ---------------------------------------- | ------------------- | ------------------------------- |
| `GET`    | `/billboards`                            | `billboards.read`   | List/search inventory           |
| `POST`   | `/billboards`                            | `billboards.create` | Create billboard                |
| `GET`    | `/billboards/{billboardId}`              | `billboards.read`   | Get one                         |
| `PATCH`  | `/billboards/{billboardId}`              | `billboards.update` | Partial update                  |
| `PUT`    | `/billboards/{billboardId}`              | `billboards.update` | Backward-compatible PATCH alias |
| `DELETE` | `/billboards/{billboardId}`              | `billboards.delete` | Delete billboard                |
| `PATCH`  | `/billboards/{billboardId}/availability` | `billboards.update` | Change status                   |
| `GET`    | `/billboards/{billboardId}/digital-spec` | `billboards.read`   | Read internal spec              |
| `PUT`    | `/billboards/{billboardId}/digital-spec` | `billboards.update` | Create/update spec              |

List query parameters:

| Parameter              | Values                                             |
| ---------------------- | -------------------------------------------------- |
| `q`                    | Search text                                        |
| `type`                 | `static`, `digital`                                |
| `city`                 | City string                                        |
| `status`               | `available`, `reserved`, `occupied`, `maintenance` |
| `minPrice`, `maxPrice` | Non-negative number                                |

Create body:

```json
{
  "name": "Dora Highway Digital Screen",
  "code": "BEI-DOR-001",
  "description": "Southbound digital placement near Dora.",
  "type": "digital",
  "location": {
    "address": "Dora Highway",
    "city": "Beirut",
    "country": "Lebanon"
  },
  "dimensions": { "width": 16, "height": 6, "unit": "m" },
  "monthlyPrice": 4500,
  "trafficCount": 1620000,
  "status": "available",
  "images": ["/images/billboards/dora-highway-digital.png"]
}
```

Digital-spec body:

```json
{
  "resolution": { "width": 3840, "height": 1440 },
  "brightness": 6500,
  "slotDurationSeconds": 10,
  "rotatingAdsCount": 6,
  "screenStatus": "on"
}
```

## Reservations

| Method  | Path                           | Authorization            | Description       |
| ------- | ------------------------------ | ------------------------ | ----------------- |
| `GET`   | `/bookings`                    | Advertiser own/admin all | List reservations |
| `POST`  | `/bookings`                    | Advertiser               | Submit request    |
| `GET`   | `/bookings/{bookingId}`        | Owner/admin              | Get one           |
| `PATCH` | `/bookings/{bookingId}/status` | Admin                    | Approve or reject |
| `POST`  | `/bookings/{bookingId}/cancel` | Owner/admin              | Cancel            |

List filters: `billboardId`, `status`.

Create body:

```json
{
  "billboardId": "64f100000000000000000001",
  "campaignName": "Summer Collection Launch",
  "objective": "awareness",
  "targetAudience": "Urban professionals across Beirut and Mount Lebanon",
  "brief": "Build reach during the June retail launch.",
  "startDate": "2026-08-10",
  "endDate": "2026-08-23",
  "creativeUrl": "https://ik.imagekit.io/example/summer-launch.mp4",
  "creativeType": "video",
  "creativeDurationSeconds": 8.4,
  "billing": {
    "contactName": "Rami Haddad",
    "email": "finance@example.com",
    "phone": "+961 70 123 456"
  },
  "company": {
    "name": "Cedar Retail SAL",
    "address": "Achrafieh, Beirut",
    "country": "Lebanon"
  },
  "paymentMethod": "e_wallet",
  "invoice": {
    "currency": "USD",
    "email": "accounts@example.com",
    "poNumber": "PO-2026-019"
  },
  "termsAccepted": true
}
```

Valid objectives: `awareness`, `product_launch`, `store_visits`, `engagement`.

New reservations accept `card` (Visa through Stripe) or `e_wallet` (Cash/Whish). A card request
must include the `stripeSetupIntentId` returned after Stripe Elements completes verification.
Legacy booking records may still contain `bank_transfer` or `cash`.

Valid booking statuses: `pending`, `approved`, `rejected`, `completed`, `cancelled`.

Creative fields are optional. When `creativeUrl` is present, `creativeType` must be `image`,
`document`, or `video`. Videos are accepted only for digital billboards, require
`creativeDurationSeconds`, and must be strictly shorter than 10 seconds. The checkout reads the
duration from the selected MP4, WebM, or MOV file before upload; the API validates the submitted
metadata.

Status update:

```json
{ "status": "approved" }
```

The server ignores client totals, recomputes pricing, and returns `409` if approval would exceed
the billboard's date capacity.

## Payments

| Method  | Path                                  | Authorization    | Description                                        |
| ------- | ------------------------------------- | ---------------- | -------------------------------------------------- |
| `POST`  | `/payments/setup`                     | Advertiser       | Create a SetupIntent for Step 3 Visa verification  |
| `POST`  | `/payments/checkout`                  | Advertiser       | Create/reuse Checkout for an approved card booking |
| `GET`   | `/payments/{bookingId}`               | Owner/admin      | Read the local payment record                      |
| `PATCH` | `/payments/{bookingId}`               | Admin            | Reconcile an offline payment                       |
| `POST`  | `/payments/{bookingId}/refund`        | Admin            | Issue a full Stripe refund                         |
| `GET`   | `/payments/session/{stripeSessionId}` | Owner/admin      | Verify Checkout and reconcile the return           |
| `POST`  | `/webhooks/stripe`                    | Stripe signature | Process payment and refund events                  |

Checkout body:

```json
{ "bookingId": "64f100000000000000000001" }
```

Offline reconciliation body:

```json
{
  "status": "partially_paid",
  "amountPaid": 800,
  "note": "Bank receipt BR-2026-184"
}
```

Valid offline statuses: `paid`, `partially_paid`, `unpaid`, `refunded`.

Refund body:

```json
{ "reason": "requested_by_customer" }
```

Card Checkout is available only after reservation approval. All amounts are loaded from the
server-side booking record; client totals are ignored. See [Payments](../guides/payments.md) for
webhook events, status transitions, and local testing.

## Creatives

| Method   | Path                             | Authorization            | Description             |
| -------- | -------------------------------- | ------------------------ | ----------------------- |
| `GET`    | `/creatives`                     | Advertiser own/admin all | List                    |
| `POST`   | `/creatives`                     | Advertiser               | Create pending creative |
| `GET`    | `/creatives/{creativeId}`        | Owner/admin              | Get                     |
| `PATCH`  | `/creatives/{creativeId}`        | Owner                    | Update name/duration    |
| `DELETE` | `/creatives/{creativeId}`        | Owner/admin              | Delete                  |
| `PATCH`  | `/creatives/{creativeId}/status` | Admin                    | Approve/reject          |

Create:

```json
{
  "name": "Summer launch landscape",
  "type": "image",
  "assetUrl": "https://ik.imagekit.io/example/summer-launch.jpg"
}
```

Video creatives require a positive `durationSeconds` value strictly below 10 seconds. The browser
reads the actual MP4, WebM, or MOV duration before upload; the shared API contract enforces the same
limit.

## Playlists

| Method   | Path                          | Authorization | Description |
| -------- | ----------------------------- | ------------- | ----------- |
| `GET`    | `/playlists?billboardId={id}` | Admin         | List        |
| `POST`   | `/playlists`                  | Admin         | Create      |
| `GET`    | `/playlists/{playlistId}`     | Admin         | Get         |
| `PATCH`  | `/playlists/{playlistId}`     | Admin         | Update      |
| `DELETE` | `/playlists/{playlistId}`     | Admin         | Delete      |

```json
{
  "billboardId": "64f100000000000000000001",
  "name": "August evening rotation",
  "creativeIds": ["64f200000000000000000001"],
  "status": "active"
}
```

## Schedules and rotation

| Method   | Path                                        | Authorization | Description               |
| -------- | ------------------------------------------- | ------------- | ------------------------- |
| `GET`    | `/schedules?billboardId={id}`               | Admin         | List                      |
| `POST`   | `/schedules`                                | Admin         | Create                    |
| `GET`    | `/schedules/{scheduleId}`                   | Admin         | Get                       |
| `PATCH`  | `/schedules/{scheduleId}`                   | Admin         | Update                    |
| `DELETE` | `/schedules/{scheduleId}`                   | Admin         | Delete                    |
| `GET`    | `/schedules/{scheduleId}/rotation`          | Admin         | Preview resolved playback |
| `GET`    | `/public/screens/{billboardId}/now-playing` | Public/device | Current rotation          |

```json
{
  "billboardId": "64f100000000000000000001",
  "playlistId": "64f300000000000000000001",
  "startAt": "2026-08-01T06:00:00.000Z",
  "endAt": "2026-08-31T22:00:00.000Z",
  "status": "scheduled"
}
```

Overlapping non-cancelled schedules return `409`.

## Impressions

| Method | Path                                        | Authorization | Description         |
| ------ | ------------------------------------------- | ------------- | ------------------- |
| `POST` | `/public/screens/{billboardId}/impressions` | Public/device | Record play event   |
| `GET`  | `/impressions`                              | Admin         | Aggregate analytics |

Record:

```json
{
  "creativeId": "64f200000000000000000001",
  "playlistId": "64f300000000000000000001",
  "scheduleId": "64f400000000000000000001",
  "occurredAt": "2026-08-12T14:30:00.000Z"
}
```

Analytics filters: `billboardId`, `creativeId`, `playlistId`.

## Upload authorization

`GET /uploads/imagekit-auth` requires an authenticated session and returns a short-lived ImageKit
token, signature, expiry, and public key. It returns `503` when ImageKit is not configured.

## User endpoints

| Method   | Path                        | Description   |
| -------- | --------------------------- | ------------- |
| `POST`   | `/user`                     | Create a user |
| `GET`    | `/user/profile?id={userId}` | Read user     |
| `PUT`    | `/user/profile`             | Update user   |
| `DELETE` | `/user/profile`             | Delete user   |

The route files delegate session enforcement to `userController`; the controller calls
`requireSession()` and the user service applies role and ownership policies.

## Error examples

Validation:

```json
{ "ok": false, "error": "The end date must be on or after the start date." }
```

Conflict:

```json
{
  "ok": false,
  "error": "These dates are already booked for this billboard. Please choose different dates."
}
```

Unauthorized:

```json
{ "ok": false, "error": "Not authenticated." }
```
