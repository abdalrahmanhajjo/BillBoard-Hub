# Development guide

## Prerequisites

- Node.js 20 or newer
- Corepack and the pnpm version declared in `package.json`
- MongoDB
- Optional ImageKit account for direct uploads

## Setup

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Configure variables using [Configuration](../reference/configuration.md).

## Useful commands

| Command                 | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| `pnpm dev`              | Start the Next.js development server         |
| `pnpm typecheck`        | Type-check without emitting files            |
| `pnpm lint`             | Run ESLint                                   |
| `pnpm lint:fix`         | Apply safe ESLint fixes                      |
| `pnpm format`           | Format source files                          |
| `pnpm format:check`     | Check formatting                             |
| `pnpm audit:deadcode`   | Find unused files, exports, and dependencies |
| `pnpm audit:duplicates` | Find exact duplicate implementation blocks   |
| `pnpm quality`          | Run all static cleanliness checks            |
| `pnpm build`            | Compile a production build                   |
| `pnpm start`            | Run the production build                     |

## Implementing a feature

1. Define shared enums and Zod contracts.
2. Add or update permission constants and policies.
3. Define module-only persistence types.
4. Add the Mongoose model and required indexes.
5. Implement repository operations.
6. Implement service business rules and authorization.
7. Add pure transformation utilities.
8. Add the controller for validation and response mapping.
9. Add thin route handlers.
10. Add feature-owned client services, hooks, components, and pages.
11. Add loading, empty, error, mobile, keyboard, and reduced-motion states.
12. Update documentation and tests.

## Backend structure

```text
src/server/modules/example/
├── example.controller.ts
├── example.model.ts
├── example.repository.ts
├── example.service.ts
├── example.types.ts
├── example.utils.ts
└── actions/                 # Only when server actions are needed
```

Rules:

- Controllers validate and translate; they do not own domain rules.
- Services own permissions, ownership, conflict detection, pricing, and orchestration.
- Repositories own database queries only.
- Models own collection shape and indexes.
- Shared contracts are the cross-layer source of truth.

## Frontend structure

```text
src/client/features/example/
├── components/
├── hooks/
├── pages/
├── services/
├── types/
├── utils/
└── validations/
```

App Router pages compose feature pages and pass server-loaded data. Reusable UI primitives belong
under `src/client/ui` only after real cross-feature use exists.

## Authentication in development

Registration creates an advertiser. Admin promotion is currently an operational database action:

```javascript
db.users.updateOne({ email: 'admin@example.com' }, { $set: { role: 'admin' } });
```

Sign out and back in after changing a role so the JWT contains the new claims.

Never use a production user or production database for local work.

## Database changes

There is no migration framework. For schema changes:

1. Make readers backward-compatible.
2. Backfill existing records with a reviewed script.
3. Make the new field required only after backfill verification.
4. Record the change in release notes and the operations log.

## Pull request expectations

- Scope is focused and unrelated code is untouched.
- New behavior is covered by proportionate tests.
- TypeScript, lint, formatting, and production build pass.
- API, environment, permissions, and operations docs are updated.
- Screenshots are included for visual changes.
- Security-sensitive decisions are called out explicitly.
