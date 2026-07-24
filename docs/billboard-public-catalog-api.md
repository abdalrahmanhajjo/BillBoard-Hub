# Public Website & Billboard Catalog — API & Testing Reference

All endpoints and pages added on the **`BB-2`** branch (Public Website & Billboard Catalog).
Covers the public storefront read surface: Browse billboards, View one billboard, and its Digital specification.

- **Base URL:** `http://localhost:3000`
- **Start the app:** `pnpm dev` (loads `.env`; requires a reachable `MONGODB_URI`)
- **Content-Type:** not required — every public endpoint is a `GET` with **no body**
- **Response envelope:** success → `{ "ok": true, "data": ... }`, failure → `{ "ok": false, "error": "message" }`

> These endpoints are the data source for the public pages (`/billboards`, `/billboards/{id}`),
> which are **server-rendered** and call the service layer directly. The routes below expose the
> same public-safe data over HTTP for reuse.

---

## 1. Authentication & authorization

**None.** Every `/api/v1/public/billboards*` route is public — no session cookie, no role, no permission
check. This is the deliberate difference from the authenticated inventory API
(`/api/v1/billboards*`, see [billboard-inventory-api.md](./billboard-inventory-api.md)).

| Concern        | Public Catalog API (`/api/v1/public/billboards*`) | Inventory API (`/api/v1/billboards*`) |
| -------------- | ------------------------------------------------- | ------------------------------------- |
| Session cookie | not required                                      | required                              |
| Methods        | `GET` only (read-only)                            | GET / POST / PUT / PATCH              |
| Who can call   | anyone                                            | admin (writes) / advertiser (reads)   |

> To have data to browse, first create billboards through the **admin** inventory API
> (`POST /api/v1/billboards`). The public routes only read.

---

## 2. Public-safe projection

The public endpoints never return internal or operational fields. Compared to the inventory API:

| Inventory field                                            | Public Catalog                                                    |
| ---------------------------------------------------------- | ----------------------------------------------------------------- |
| `status` (`available`/`reserved`/`occupied`/`maintenance`) | replaced by boolean **`isAvailable`** (only `available` → `true`) |
| `code`                                                     | **omitted**                                                       |
| `createdAt`, `updatedAt`                                   | **omitted**                                                       |
| `trafficCount`                                             | **included** (optional; omitted when not set)                     |
| `description`                                              | included (optional; omitted when not set)                         |
| digital spec `screenStatus`                                | **omitted** (operational state)                                   |
| digital spec `id`, `billboardId`, timestamps               | **omitted**                                                       |

**`PublicBillboard` shape:**

```json
{
  "id": "6a626c66eab1429458c4d0e6",
  "name": "Downtown Static Board",
  "description": "Prime static location on the main square",
  "type": "static",
  "location": { "address": "1 Martyrs Square", "city": "Tripoli", "country": "Libya" },
  "dimensions": { "width": 6, "height": 3, "unit": "m" },
  "monthlyPrice": 1500,
  "trafficCount": 45000,
  "images": ["https://example.com/billboard-a.jpg"],
  "isAvailable": true
}
```

**`PublicDigitalSpec` shape:**

```json
{
  "resolution": { "width": 1920, "height": 1080 },
  "brightness": 5000,
  "slotDurationSeconds": 10,
  "rotatingAdsCount": 6
}
```

> `description` and `trafficCount` are optional. When a billboard has no value for them the key is
> **absent** from the JSON (not `null`).

---

## 3. Enum reference

| Field             | Allowed values                          |
| ----------------- | --------------------------------------- |
| `type`            | `static`, `digital`                     |
| `isAvailable`     | `true`, `false` (derived from `status`) |
| `dimensions.unit` | `m`, `ft`                               |

> The full catalog is returned regardless of availability; unavailable billboards simply come back
> with `isAvailable: false`. The reason (reserved/occupied/maintenance) is never exposed.

---

## 4. Endpoints

### 4.1 List billboards

`GET /api/v1/public/billboards` — **public** — success `200` — no body

Returns the whole collection as `PublicBillboard[]`, newest first.

```bash
curl http://localhost:3000/api/v1/public/billboards
```

```json
{
  "ok": true,
  "data": {
    "billboards": [
      {
        "id": "6a626c66eab1429458c4d0e6",
        "name": "Downtown Static Board",
        "description": "Prime static location on the main square",
        "type": "static",
        "location": { "address": "1 Martyrs Square", "city": "Tripoli", "country": "Libya" },
        "dimensions": { "width": 6, "height": 3, "unit": "m" },
        "monthlyPrice": 1500,
        "trafficCount": 45000,
        "images": ["https://example.com/billboard-a.jpg"],
        "isAvailable": true
      }
    ]
  }
}
```

> No query parameters. Filtering/search for the storefront is applied on the client; the endpoint
> always returns the full public collection.

---

### 4.2 Get one billboard

`GET /api/v1/public/billboards/{id}` — **public** — success `200` — no body

```bash
curl http://localhost:3000/api/v1/public/billboards/{id}
```

```json
{
  "ok": true,
  "data": {
    "billboard": {
      "id": "6a626c66eab1429458c4d0e6",
      "name": "Downtown Static Board",
      "type": "static",
      "location": { "address": "1 Martyrs Square", "city": "Tripoli", "country": "Libya" },
      "dimensions": { "width": 6, "height": 3, "unit": "m" },
      "monthlyPrice": 1500,
      "images": ["https://example.com/billboard-a.jpg"],
      "isAvailable": true
    }
  }
}
```

- Unknown id → `404 { "ok": false, "error": "Billboard not found." }`
- Malformed id → `404 { "ok": false, "error": "Not found." }`

---

### 4.3 Read digital specification

`GET /api/v1/public/billboards/{id}/digital-spec` — **public** — success `200` — no body

```bash
curl http://localhost:3000/api/v1/public/billboards/{id}/digital-spec
```

```json
{
  "ok": true,
  "data": {
    "spec": {
      "resolution": { "width": 1920, "height": 1080 },
      "brightness": 5000,
      "slotDurationSeconds": 10,
      "rotatingAdsCount": 6
    }
  }
}
```

`spec` is `null` when the billboard is not digital or has no specification saved yet:

```json
{ "ok": true, "data": { "spec": null } }
```

---

## 5. Frontend pages (browser, no session)

| URL                                     | What to test                                                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `http://localhost:3000/billboards`      | Responsive card grid — image, name, location, type, monthly price, Available/Unavailable badge. Cards link to details |
| `http://localhost:3000/billboards/{id}` | Details — image gallery, description, dimensions, location, traffic count, price, type, digital specs, Reserve button |

> Both pages render server-side and work without logging in. A digital billboard's details page also
> shows the digital specifications panel.

---

## 6. Negative / edge cases

| Request                                                  | Expected                                   |
| -------------------------------------------------------- | ------------------------------------------ |
| `GET /api/v1/public/billboards/000000000000000000000000` | `404` `Billboard not found.`               |
| `GET /api/v1/public/billboards/not-an-object-id`         | `404` `Not found.`                         |
| `GET /api/v1/public/billboards/{static-id}/digital-spec` | `200` `{ "data": { "spec": null } }`       |
| `POST /api/v1/public/billboards`                         | `405` Method Not Allowed (read-only route) |
| Browser `GET /billboards/{unknown-id}`                   | Next.js **404** page                       |

---

## 7. One-shot smoke script

No cookies required. Requires `python3` for id extraction. Create some billboards via the admin
inventory API first (see [billboard-inventory-api.md](./billboard-inventory-api.md) §1 & §6).

```bash
BASE=http://localhost:3000
first_id() { python3 -c "import sys,json;bs=json.load(sys.stdin)['data']['billboards'];print(bs[0]['id'] if bs else '')"; }

curl -s $BASE/api/v1/public/billboards                       # list (public)
ID=$(curl -s $BASE/api/v1/public/billboards | first_id)
echo "first billboard = $ID"
curl -s $BASE/api/v1/public/billboards/$ID                   # get one (public)
curl -s $BASE/api/v1/public/billboards/$ID/digital-spec      # spec (null unless digital w/ spec)
```
