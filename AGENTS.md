<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## BillBoard Hub Agent Guidelines

### Core Architecture Rules

1. Keep App Router files thin.
2. Page files in `src/app` should compose feature pages only.
3. Route handlers should delegate to controllers/services; no business logic in handlers.
4. Shared business rules must live in module services.
5. Database reads/writes must flow through repositories.
6. Validation should use shared Zod contracts under `src/shared/contracts/*`; module validators are optional and should exist only when composing schemas or adding module-specific validation logic.
7. Controllers should return responses through shared helpers in `src/server/http/*` to keep API output and status handling consistent.

### Backend Module Structure

Use module-local structure under `src/server/modules/<module>/`.

Required module files:
- `*.controller.ts`
- `*.service.ts`
- `*.repository.ts`
- `actions/*.action.ts`
- `*.types.ts`

Optional module files:
- `*.validator.ts` (only when not using shared contracts directly, or when composing module-specific validation logic)

Do not place new domain logic in global layer folders like `server/controllers` or `server/services`.

### Authorization and Permissions

1. Keep role/permission rules centralized in `src/shared/policies` and `src/shared/constants/permissions`.
2. Route middleware is the first gate; services are the second gate.
3. Never trust client role claims.
4. Inactive users must be denied access.

### Edge Runtime Constraints

1. `src/middleware.ts` runs in Edge runtime; do not import `@/auth` or Node-only dependencies there.
2. Keep middleware checks coarse (session cookie presence, route prefix checks).
3. Perform role enforcement in server layouts and service/policy layer where Node runtime is available.

### Auth Placement

1. Keep `src/auth.ts` as a thin facade only.
2. Place Auth.js internals in `src/server/modules/auth/*` (config, callbacks, token helpers).
3. Keep Node-only auth dependencies out of middleware and frontend code.

### Time and Scheduling

1. Persist all timestamps in UTC.
2. Keep scheduling logic isolated in service layer so conflict detection can be upgraded later.

### Feature Ownership

Each feature should own:
- `components`
- `hooks`
- `pages`
- `services`
- `types`
- `validations`
- `utils`

Promote code to shared only after real cross-feature reuse exists.

Frontend feature code should live under `src/client/features/*`; App Router files in `src/app` should compose from those feature modules.

When a schema/type is used by both frontend and backend, move it to `src/shared/contracts/*` and re-export from feature folders if needed.

### Coding Safety

1. Make minimal changes and avoid refactoring unrelated files.
2. Preserve public APIs unless explicitly changing them.
3. Validate with `pnpm exec tsc --noEmit` and `pnpm lint` after meaningful changes.
4. Prefer deterministic behavior and explicit error handling.
