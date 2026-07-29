# Configuration reference

Create `.env.local` for development. Never commit `.env`, `.env.local`, or production secrets.

## Variables

| Variable                             | Required    | Scope         | Description                                  | Example                     |
| ------------------------------------ | ----------- | ------------- | -------------------------------------------- | --------------------------- |
| `MONGODB_URI`                        | Yes         | Server        | MongoDB connection string                    | `mongodb://127.0.0.1:27017` |
| `MONGODB_DB_NAME`                    | Yes         | Server        | Shared application/Auth.js database name     | `billboard_hub`             |
| `AUTH_SECRET`                        | Yes         | Server        | Auth.js signing/encryption secret            | Generated random value      |
| `NEXTAUTH_URL`                       | Production  | Server        | Canonical application URL                    | `https://boardly.example`   |
| `NEXT_PUBLIC_SITE_URL`               | Production  | Public/client | SEO canonical and sitemap origin             | `https://boardly.example`   |
| `ACCESS_TOKEN_TTL_MS`                | Yes         | Server        | Opaque access token lifetime in milliseconds | `900000`                    |
| `REFRESH_TOKEN_TTL_MS`               | Yes         | Server        | Refresh metadata lifetime in milliseconds    | `2592000000`                |
| `SALT_ROUNDS`                        | Recommended | Server        | bcrypt work factor                           | `12`                        |
| `IMAGEKIT_PRIVATE_KEY`               | For uploads | Server        | ImageKit signing key                         | Secret                      |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`    | For uploads | Public/client | ImageKit public key                          | Public key                  |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`  | For uploads | Public/client | ImageKit delivery endpoint                   | `https://ik.imagekit.io/id` |
| `STRIPE_SECRET_KEY`                  | For cards   | Server        | Stripe test or live secret API key           | `sk_test_...`               |
| `STRIPE_WEBHOOK_SECRET`              | For cards   | Server        | Signing secret for the configured webhook    | `whsec_...`                 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For cards   | Public/client | Stripe Elements publishable API key          | `pk_test_...`               |
| `GOOGLE_SITE_VERIFICATION`           | Optional    | Server        | Search Console verification token            | Token only                  |
| `NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID`  | Optional    | Public/client | Google Tag Manager container id              | `GTM-XXXXXXX`               |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`      | Optional    | Public/client | Direct GA4 measurement id                    | `G-XXXXXXXXXX`              |
| `NODE_ENV`                           | Managed     | Runtime       | Development/test/production behavior         | `production`                |

## Example

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=billboard_hub
AUTH_SECRET=replace-with-at-least-32-random-bytes
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ACCESS_TOKEN_TTL_MS=900000
REFRESH_TOKEN_TTL_MS=2592000000
SALT_ROUNDS=12

# Optional until uploads are enabled
IMAGEKIT_PRIVATE_KEY=
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=

# Required when card payments are enabled
STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_replace_me

GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

Generate an Auth.js secret:

```bash
openssl rand -base64 32
```

## Important constraints

- Always set `MONGODB_DB_NAME`. The Mongoose and Auth.js helpers currently have different fallback
  spellings; an explicit value guarantees both use the same database.
- Token TTL values must be valid positive millisecond integers. The current token module parses
  them directly and does not supply defaults.
- `NEXT_PUBLIC_*` values are included in client bundles. Never place a private key in one.
- Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS production origin without a path.
- Configure either Google Tag Manager or direct GA4. When both are set, the application loads only
  Tag Manager to avoid duplicate page views.
- Rotate `AUTH_SECRET` carefully: existing sessions become invalid.
- Stripe test and live modes use different publishable keys, secret keys, and webhook signing
  secrets. Never mix them.
- `NEXTAUTH_URL` is also used for Stripe return URLs and must be the canonical HTTPS origin.
- Increase `SALT_ROUNDS` only after measuring login and registration latency in the target runtime.

## Environment ownership

| Environment | Recommended storage                      |
| ----------- | ---------------------------------------- |
| Local       | `.env.local`, excluded from Git          |
| CI          | Encrypted CI variables                   |
| Preview     | Hosting-provider preview secrets         |
| Production  | Managed secret store with audited access |

Document secret ownership, rotation date, and recovery procedure outside the repository.
