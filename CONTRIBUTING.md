# Contributing Guide

This document defines the implementation rules for backend and API work in BillBoard Hub.

## Prerequisites

1. Node.js 20+
2. pnpm (Corepack recommended)
3. MongoDB connection string

## Environment Variables

Create `.env.local` in the project root.

```env
MONGODB_URI=<your-mongodb-connection-string>
MONGODB_DB_NAME=billboard_hub
AUTH_SECRET=<your-auth-secret>
NEXTAUTH_URL=http://localhost:3000
SALT_ROUNDS=12
```

## Install, Run, Validate

```bash
pnpm install
pnpm dev
pnpm quality
pnpm audit --prod
pnpm peers check
pnpm build
```

## Architecture Boundaries

Frontend:

- `src/app`: routing, layouts, API route handlers only
- `src/client/features/*`: feature-owned UI and client logic

Shared:

- `src/shared/contracts/*`: Zod schemas shared by frontend and backend
- `src/shared/constants/*`: role and permission constants
- `src/shared/policies/*`: policy checks and authorization rules
- `src/shared/types/*`: shared payload and domain types

Backend:

- `src/server/modules/<feature>`: controller, service, repository, actions, types
- `src/server/db/*`: database helpers
- `src/server/http/*`: standardized API response and controller error utilities

Auth:

- `src/auth.ts`: thin Auth.js facade
- `src/server/modules/auth/*`: config, callbacks, token helpers, module logic

## API Response And Error Handling Standard

Use the shared helpers from `src/server/http/*` for all controller and API responses.

1. Return JSON through `apiResponse` helpers only (`ok`, `success`, `badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `internal`).
2. Use `requireSession()` in controllers that require authentication.
3. Use `handleControllerError()` in `catch` blocks to normalize status mapping.
4. Keep route handlers thin: parse request, delegate to controller, return controller result.
5. Avoid creating `new Response(...)` directly in routes unless streaming/file response is required.

## Backend Feature Playbook (API-First)

Follow this order exactly for new backend features and APIs.

1. Create model

- Add database model file under `src/server/modules/<feature>/<feature>.model.ts`.
- Keep persistence shape and indexes here only.

2. Create repository

- Add `src/server/modules/<feature>/<feature>.repository.ts`.
- Put database IO only (query/create/update/delete).
- Do not add business logic or permission logic in repository.

3. Create shared schemas

- Add Zod schemas under `src/shared/contracts/<feature>/*.schema.ts`.
- Export input/output types from schemas.
- Use these schemas directly from controllers/services.

4. Add permissions and policy constants

- Add permissions in `src/shared/constants/permissions/*`.
- Add or update feature policy in `src/shared/policies/modules/*`.
- Keep authorization checks centralized in policy layer.

5. Add shared types for payloads/contracts

- Add payload and contract types under `src/shared/types/<feature>.ts` when shared across layers.
- Keep module-only persistence types under `src/server/modules/<feature>/<feature>.types.ts`.

6. Create feature utils and service

- Add `<feature>.utils.ts` for pure helper transforms.
- Add `<feature>.service.ts` for business rules, orchestration, and policy enforcement.

7. Create controller

- Add `<feature>.controller.ts`.
- Validate payloads with shared contracts.
- Use `src/server/http/*` utilities for response and error handling.

8. Create API routes

- Add route handlers under `src/app/api/v1/<feature>/*/route.ts`.
- Keep handlers minimal and delegate to controller methods.

9. Add module actions when needed

- Add `src/server/modules/<feature>/actions/*.action.ts` only when server actions are required.

10. Validate and document

- Run `pnpm quality`, `pnpm audit --prod`, `pnpm peers check`, and `pnpm build`.
- Update `README.md`, `CONTRIBUTING.md`, and `AGENTS.md` when architecture conventions change.

## Edge Runtime Rule

`src/proxy.ts` runs in Edge runtime.

1. Do not import `@/auth` or Node-only dependencies there.
2. Keep middleware checks coarse.
3. Enforce strict authorization in policies, services, and server layouts.

## Documentation Requirement

Every change that affects a public contract, environment variable, permission, collection,
operational dependency, or release procedure must update the matching document under `docs/`.
The canonical index is `docs/README.md`.
