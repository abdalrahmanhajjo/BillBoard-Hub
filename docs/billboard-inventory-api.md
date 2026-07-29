# Billboard Inventory — API & Testing Reference

All endpoints and pages added on the **`BB-7`** branch (Billboard Inventory Management).
Covers: Create, View list, View details, Update info, Change availability, and Digital specifications.

- **Base URL:** `http://localhost:3000`
- **Start the app:** `pnpm dev` (loads `.env`; requires a reachable `MONGODB_URI`)
- **Content-Type:** `application/json` for every request that has a body
- **Response envelope:** success → `{ "ok": true, "data": ... }`, failure → `{ "ok": false, "error": "message" }`

---

## 1. Authentication & authorization

Every `/api/v1/billboards*` route requires a valid session cookie (`authjs.session-token`).

| Action                             | Required permission | Role that has it  |
| ---------------------------------- | ------------------- | ----------------- |
| Read (list / get / read spec)      | `billboards.read`   | admin, advertiser |
| Create                             | `billboards.create` | admin             |
| Update info / availability / specs | `billboards.update` | admin             |

> Registration creates an **advertiser**. To exercise the write endpoints you must have an **admin** session.

### Get an admin session

```bash
# 1) Register (creates an advertiser)
curl -c cookies.txt -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"firstName":"BB","lastName":"Admin","email":"admin@test.com","password":"Password123","confirmPassword":"Password123"}'

# 2) Promote to admin in MongoDB (mongosh or any client):
#    db.users.updateOne({ email: "admin@test.com" }, { $set: { role: "admin" } })

# 3) Login AFTER promoting (the session token captures the role at login time)
curl -c cookies.txt -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@test.com","password":"Password123"}'
```

Send `-b cookies.txt` on every request below. Replace `{id}` with an id from a create/list response.

---

## 2. Enum reference

| Field                         | Allowed values                                     |
| ----------------------------- | -------------------------------------------------- |
| `type`                        | `static`, `digital`                                |
| `status` (availability)       | `available`, `reserved`, `occupied`, `maintenance` |
| `dimensions.unit`             | `m`, `ft`                                          |
| `screenStatus` (digital spec) | `on`, `off`, `standby`, `fault`                    |

Booking rule: only `status === "available"` is bookable (`isBillboardBookable` / `billboardService.assertBookable`).

---

## 3. Endpoints

### 3.1 Create billboard

`POST /api/v1/billboards` — **admin** — success `201`

Body schema (`createBillboardSchema`):

| Field               | Type     | Rules                               |
| ------------------- | -------- | ----------------------------------- |
| `name`              | string   | required, min 2                     |
| `code`              | string   | required, min 2, **unique**         |
| `description`       | string   | optional, max 1000                  |
| `type`              | enum     | required — `static` \| `digital`    |
| `location.address`  | string   | required, min 2                     |
| `location.city`     | string   | required, min 2                     |
| `location.country`  | string   | required, min 2                     |
| `dimensions.width`  | number   | required, > 0                       |
| `dimensions.height` | number   | required, > 0                       |
| `dimensions.unit`   | enum     | `m` \| `ft`                         |
| `monthlyPrice`      | number   | required, > 0                       |
| `status`            | enum     | optional, default `available`       |
| `images`            | string[] | optional (valid URLs), default `[]` |

**Mock body — static:**

```json
{
  "name": "Downtown Static Board",
  "code": "DT-STATIC-1",
  "description": "Prime static location on the main square",
  "type": "static",
  "location": { "address": "1 Martyrs Square", "city": "Tripoli", "country": "Libya" },
  "dimensions": { "width": 6, "height": 3, "unit": "m" },
  "monthlyPrice": 1500,
  "status": "available",
  "images": ["https://example.com/billboard-a.jpg"]
}
```

**Mock body — digital:**

```json
{
  "name": "Airport Digital Screen",
  "code": "AP-DIG-1",
  "type": "digital",
  "location": { "address": "Airport Road", "city": "Tripoli", "country": "Libya" },
  "dimensions": { "width": 10, "height": 5, "unit": "m" },
  "monthlyPrice": 5000,
  "status": "available",
  "images": []
}
```

**Success `201`:**

```json
{
  "ok": true,
  "data": {
    "id": "6a626c66eab1429458c4d0e6",
    "name": "Downtown Static Board",
    "code": "DT-STATIC-1",
    "description": "Prime static location on the main square",
    "type": "static",
    "location": { "address": "1 Martyrs Square", "city": "Tripoli", "country": "Libya" },
    "dimensions": { "width": 6, "height": 3, "unit": "m" },
    "monthlyPrice": 1500,
    "status": "available",
    "images": ["https://example.com/billboard-a.jpg"],
    "createdAt": "2026-07-23T19:32:54.958Z",
    "updatedAt": "2026-07-23T19:32:54.958Z"
  }
}
```

**curl:**

```bash
curl -b cookies.txt -X POST http://localhost:3000/api/v1/billboards \
  -H 'Content-Type: application/json' \
  -d '{"name":"Downtown Static Board","code":"DT-STATIC-1","description":"Prime static location","type":"static","location":{"address":"1 Martyrs Square","city":"Tripoli","country":"Libya"},"dimensions":{"width":6,"height":3,"unit":"m"},"monthlyPrice":1500,"status":"available","images":["https://example.com/billboard-a.jpg"]}'
```

---

### 3.2 List billboards

`GET /api/v1/billboards` — **admin or advertiser** — success `200` — no body

```bash
curl -b cookies.txt http://localhost:3000/api/v1/billboards
```

```json
{
  "ok": true,
  "data": {
    "billboards": [
      {
        "id": "…",
        "name": "…",
        "code": "…",
        "type": "static",
        "status": "available",
        "monthlyPrice": 1500,
        "location": { "address": "…", "city": "…", "country": "…" },
        "dimensions": { "width": 6, "height": 3, "unit": "m" },
        "images": [],
        "createdAt": "…",
        "updatedAt": "…"
      }
    ]
  }
}
```

> Search is performed client-side on the admin page (over name, code, type, address, city, country); there is no `?search=` query parameter.

---

### 3.3 Get one billboard

`GET /api/v1/billboards/{id}` — **admin or advertiser** — success `200` — no body

```bash
curl -b cookies.txt http://localhost:3000/api/v1/billboards/{id}
```

```json
{ "ok": true, "data": { "billboard": { "id": "…", "name": "…", "...": "..." } } }
```

Unknown id → `404 { "ok": false, "error": "Billboard not found." }`

---

### 3.4 Update billboard information

`PUT /api/v1/billboards/{id}` — **admin** — success `200`

Partial update (`updateBillboardSchema`) — send **any subset**, at least one field:

| Field          | Type     | Rules                                                         |
| -------------- | -------- | ------------------------------------------------------------- |
| `description`  | string   | optional, max 1000                                            |
| `monthlyPrice` | number   | optional, > 0                                                 |
| `location`     | object   | optional — full `{ address, city, country }` when present     |
| `images`       | string[] | optional (valid URLs)                                         |
| `status`       | enum     | optional — `available`\|`reserved`\|`occupied`\|`maintenance` |

**Mock body — full:**

```json
{
  "description": "Updated marketing copy",
  "monthlyPrice": 2000,
  "location": { "address": "5 New Avenue", "city": "Benghazi", "country": "Libya" },
  "images": ["https://example.com/updated.jpg"],
  "status": "reserved"
}
```

**Mock body — minimal:**

```json
{ "monthlyPrice": 1800 }
```

**Success `200`:** returns the full updated billboard (`{ ok, data: { ...billboard } }`).

```bash
curl -b cookies.txt -X PUT http://localhost:3000/api/v1/billboards/{id} \
  -H 'Content-Type: application/json' \
  -d '{"monthlyPrice":2000,"description":"Updated marketing copy","status":"reserved"}'
```

---

### 3.5 Change availability status

`PATCH /api/v1/billboards/{id}/availability` — **admin** — success `200`

Body (`updateAvailabilitySchema`):

| Field    | Type | Rules                                                         |
| -------- | ---- | ------------------------------------------------------------- |
| `status` | enum | required — `available`\|`reserved`\|`occupied`\|`maintenance` |

**Mock body:**

```json
{ "status": "occupied" }
```

**Success `200`:** returns the full updated billboard.

```bash
curl -b cookies.txt -X PATCH http://localhost:3000/api/v1/billboards/{id}/availability \
  -H 'Content-Type: application/json' \
  -d '{"status":"occupied"}'
```

---

### 3.6 Read digital specification

`GET /api/v1/billboards/{id}/digital-spec` — **admin or advertiser** — success `200` — no body

```bash
curl -b cookies.txt http://localhost:3000/api/v1/billboards/{id}/digital-spec
```

```json
{ "ok": true, "data": { "spec": null } }
```

`spec` is `null` when no specification has been saved yet.

---

### 3.7 Save digital specification (upsert)

`PUT /api/v1/billboards/{id}/digital-spec` — **admin** — success `200`

One billboard → one spec record (upsert). Only valid for a **digital** billboard.

Body (`upsertDigitalSpecSchema`):

| Field                 | Type    | Rules                           |
| --------------------- | ------- | ------------------------------- |
| `resolution.width`    | integer | required, > 0 (px)              |
| `resolution.height`   | integer | required, > 0 (px)              |
| `brightness`          | number  | required, > 0 (nits)            |
| `slotDurationSeconds` | number  | required, > 0                   |
| `rotatingAdsCount`    | integer | required, ≥ 1                   |
| `screenStatus`        | enum    | `on`\|`off`\|`standby`\|`fault` |

**Mock body:**

```json
{
  "resolution": { "width": 1920, "height": 1080 },
  "brightness": 5000,
  "slotDurationSeconds": 10,
  "rotatingAdsCount": 6,
  "screenStatus": "on"
}
```

**Success `200`:**

```json
{
  "ok": true,
  "data": {
    "id": "6a626c6a188bdb855402599f",
    "billboardId": "6a626c67eab1429458c4d0e7",
    "resolution": { "width": 1920, "height": 1080 },
    "brightness": 5000,
    "slotDurationSeconds": 10,
    "rotatingAdsCount": 6,
    "screenStatus": "on",
    "createdAt": "2026-07-23T19:32:58.606Z",
    "updatedAt": "2026-07-23T19:33:46.225Z"
  }
}
```

```bash
curl -b cookies.txt -X PUT http://localhost:3000/api/v1/billboards/{id}/digital-spec \
  -H 'Content-Type: application/json' \
  -d '{"resolution":{"width":1920,"height":1080},"brightness":5000,"slotDurationSeconds":10,"rotatingAdsCount":6,"screenStatus":"on"}'
```

> Sending this to a **static** billboard returns `400 "Only digital billboards can have specifications."`

---

## 4. Frontend pages (browser, admin session)

| URL                                                | What to test                                                                                                                       |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `http://localhost:3000/user/admin/billboards`      | Inventory list, **search box**, create form, colored status badges, inline status change per row, "Digital specifications" manager |
| `http://localhost:3000/user/admin/billboards/{id}` | Details view (all fields + images + digital specs) and the **Edit** toggle (description, price, location, images, status)          |

---

## 5. Negative / edge cases

| Request                                             | Expected                                                 |
| --------------------------------------------------- | -------------------------------------------------------- |
| Any `/api/v1/billboards*` without a session cookie  | `401` `Not authenticated.`                               |
| `POST /billboards` as an **advertiser**             | `401` `You cannot create billboards.`                    |
| `POST /billboards` with a duplicate `code`          | `409` `Billboard code is already in use.`                |
| `POST /billboards` with `monthlyPrice: -5`          | `400` `Monthly price must be greater than 0.`            |
| `POST /billboards` with `location.address: "x"`     | `400` `Address is required.`                             |
| `PATCH .../availability` with `{"status":"banana"}` | `400` invalid-option message                             |
| `PUT .../digital-spec` on a **static** billboard    | `400` `Only digital billboards can have specifications.` |
| `PUT .../digital-spec` with `rotatingAdsCount: 0`   | `400` `There must be at least one rotating ad.`          |
| `GET /billboards/{unknown-id}`                      | `404` `Billboard not found.`                             |
| `PUT /billboards/{id}` with `{}` (no fields)        | `400` `At least one field must be provided.`             |

---

## 6. One-shot smoke script

Run after obtaining an **admin** `cookies.txt` (section 1). Requires `python3` for id extraction.

```bash
BASE=http://localhost:3000
J="-b cookies.txt"
id() { python3 -c "import sys,json;print(json.load(sys.stdin)['data']['id'])"; }

STATIC=$(curl -s $J -X POST $BASE/api/v1/billboards -H 'Content-Type: application/json' \
  -d '{"name":"Downtown Static","code":"DT-1","type":"static","location":{"address":"1 Sq","city":"Tripoli","country":"Libya"},"dimensions":{"width":6,"height":3,"unit":"m"},"monthlyPrice":1500,"status":"available"}' | id)

DIGITAL=$(curl -s $J -X POST $BASE/api/v1/billboards -H 'Content-Type: application/json' \
  -d '{"name":"Airport Digital","code":"AP-1","type":"digital","location":{"address":"Airport Rd","city":"Tripoli","country":"Libya"},"dimensions":{"width":10,"height":5,"unit":"m"},"monthlyPrice":5000}' | id)

curl -s $J $BASE/api/v1/billboards                                   # list
curl -s $J $BASE/api/v1/billboards/$STATIC                           # get one
curl -s $J -X PATCH $BASE/api/v1/billboards/$STATIC/availability -H 'Content-Type: application/json' -d '{"status":"occupied"}'
curl -s $J -X PUT   $BASE/api/v1/billboards/$STATIC -H 'Content-Type: application/json' -d '{"monthlyPrice":2000,"description":"Edited"}'
curl -s $J -X PUT   $BASE/api/v1/billboards/$DIGITAL/digital-spec -H 'Content-Type: application/json' \
  -d '{"resolution":{"width":1920,"height":1080},"brightness":5000,"slotDurationSeconds":10,"rotatingAdsCount":6,"screenStatus":"on"}'
curl -s $J $BASE/api/v1/billboards/$DIGITAL/digital-spec            # read spec
```
