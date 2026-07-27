# BillBoard Hub

BillBoard Hub is a role-based SaaS dashboard for managing traditional and digital billboard operations.

## Core Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Auth.js (NextAuth v5 beta)
- MongoDB + Mongoose
- React Hook Form + Zod

## Application Areas

- Guest
  - `/login`
  - `/register`
  - `/forgot-password`
- Authenticated Dashboard
  - `/dashboard/admin/*`
  - `/dashboard/advertiser/*`

## Architecture

### Frontend

- `src/app`: routes, layouts, route handlers only
- `src/client/features`: feature-owned UI and client logic

Each feature owns:

- components
- hooks
- pages
- services
- types
- validations
- utils

### Backend

Module-based MVC under `src/server/modules`:

- `controller`
- `service`
- `repository`
- `actions`
- `types`

Optional when needed:

- `validator` (only for module-specific schema composition)

Controllers should use shared response/error helpers from `src/server/http/*` to keep API behavior consistent.

Route handlers and server actions must delegate to services. Business logic belongs in services.

### Authorization

- Permission constants: `src/shared/constants/permissions/*`
- Policy layer: `src/shared/policies/*`
- Request guard: `src/proxy.ts`

`src/proxy.ts` runs in Edge runtime and performs coarse route/session checks only.
Role enforcement is handled in server layouts and in the service/policy layer.

This keeps middleware Edge-compatible while preserving strict server-side authorization.

### Database

- Mongoose connection helper: `src/server/db/mongoose.ts`
- Mongo client for Auth.js adapter: `src/server/db/mongodb-client.ts`

All timestamps should be stored in UTC.

## Authentication Foundation

Implemented foundations:

- Auth.js v5 credentials provider
- JWT-based sessions for credentials login
- Role-aware session shaping
- Inactive-user login rejection
- Short-lived access token exposed through session (in-memory client usage)
- Refresh token retained inside server-managed httpOnly session cookie payload
- Protected dashboard routes
- Basic auth server actions and API endpoints

API-first auth endpoints for testing:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

All endpoints return JSON with `ok` and either `data` or `error`.

Postman collection:

- `postman/BillBoard-Hub-Auth.postman_collection.json`

When testing with Postman, keep cookies enabled so session state is preserved between `login`, `me`, `refresh`, and `logout`.

Key files:

- `src/auth.ts` (facade)
- `src/server/modules/auth/config.ts`
- `src/server/modules/auth/callbacks.ts`
- `src/server/modules/auth/tokens.ts`
- `src/server/http/api-response.ts`
- `src/server/http/controller-utils.ts`
- `src/proxy.ts`
- `src/server/modules/auth/*`
- `src/server/modules/users/user.model.ts`

## Local Setup

1. Create `.env.local`:

```env
MONGODB_URI=<your-mongodb-connection-string>
MONGODB_DB_NAME=billboard_hub
AUTH_SECRET=<your-auth-secret>
NEXTAUTH_URL=http://localhost:3000
```

2. Install dependencies:

```bash
pnpm install
```

3. Start development server:

```bash
pnpm dev
```

## Quality Checks

```bash
pnpm exec tsc --noEmit
pnpm lint
```

## Developer Workflow

For detailed contributor instructions and a step-by-step "start a new feature" guide, see:

- `CONTRIBUTING.md`
- `AGENTS.md`
- `CLAUDE.md`
