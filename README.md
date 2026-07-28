# Boardly — BillBoard Hub

Boardly is a full-stack billboard marketplace and operations platform for Lebanon. It combines a
public inventory catalog with role-based administration, advertiser reservations, creative
management, digital-screen playlists, scheduling, playback rotation, and impression analytics.

## What is implemented

- Public marketing site and database-backed billboard catalog
- Static and digital billboard inventory management
- Advertiser reservation requests, pricing, conflict checks, moderation, and cancellation
- Creative uploads and admin moderation
- Digital-screen playlists and non-overlapping schedules
- Public now-playing and impression-ingestion endpoints
- Admin impression analytics and playback preview
- Credentials authentication with admin and advertiser roles

## Technology

- Next.js 16 App Router and React 19
- TypeScript and Zod
- Tailwind CSS 4 and customized shadcn components
- Auth.js 5 with JWT sessions
- MongoDB, Mongoose, and the Auth.js MongoDB adapter
- React Hook Form, Motion, and ImageKit

## Routes

- Guest
  - `/login`
  - `/register`
  - `/forgot-password`
- Authenticated Dashboard
  - `/user/admin/*`
  - `/user/advertiser/*`

## Quick start

Prerequisites: Node.js 20+, Corepack, pnpm, and MongoDB.

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

The application is available at [http://localhost:3000](http://localhost:3000).

Required environment configuration is documented in
[Configuration](docs/reference/configuration.md).

## Validation

```bash
pnpm quality
pnpm audit --prod
pnpm peers check
pnpm build
```

## Documentation

Start with the [documentation index](docs/README.md).

| Area                            | Document                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------- |
| Project documentation           | [Project documentation](docs/PROJECT_DOCUMENTATION.md)                           |
| Complete developer handover     | [Developer handover](docs/HANDOVER.md)                                           |
| System design                   | [Architecture](docs/architecture/overview.md)                                    |
| Domain behavior                 | [Modules](docs/architecture/modules.md)                                          |
| Collections and relationships   | [Data model](docs/architecture/data-model.md)                                    |
| HTTP endpoints                  | [API reference](docs/reference/api.md)                                           |
| Environment variables           | [Configuration](docs/reference/configuration.md)                                 |
| Authentication and permissions  | [Authentication and security](docs/security/authentication-and-authorization.md) |
| Local workflow                  | [Development guide](docs/guides/development.md)                                  |
| Quality assurance               | [Testing strategy](docs/guides/testing.md)                                       |
| Production delivery             | [Deployment guide](docs/guides/deployment.md)                                    |
| Incident response               | [Operations runbook](docs/operations/runbook.md)                                 |
| Current gaps                    | [Known limitations](docs/known-limitations.md)                                   |
| SEO research and implementation | [SEO documentation](docs/seo/README.md)                                          |
| Code cleanliness and refactors  | [Code quality audit](docs/code-quality/README.md)                                |

## Repository structure

```text
src/
├── app/                  # Thin pages, layouts, and route handlers
├── client/features/      # Feature-owned UI, hooks, services, and pages
├── client/ui/            # Shared customized shadcn primitives
├── server/db/            # Database connection helpers
├── server/http/          # API envelopes and error normalization
├── server/modules/       # Domain controllers, services, repositories, and models
└── shared/               # Contracts, constants, policies, pricing, types, and utilities
```

## Contribution policy

Read [CONTRIBUTING.md](CONTRIBUTING.md) before modifying the system. App Router files stay thin,
business logic belongs in services, database access belongs in repositories, and cross-layer
validation belongs in shared Zod contracts.

## License

No public license is currently declared. Treat this repository as proprietary unless the project
owner specifies otherwise.
