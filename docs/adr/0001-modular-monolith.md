# ADR-0001: Use a feature-oriented modular monolith

- Status: Accepted
- Date: 2026-07-27

## Context

Boardly serves public pages, authenticated dashboards, reservation workflows, and digital-screen
operations. The product needs clear business boundaries without the deployment and observability
cost of independent services.

## Decision

Keep one Next.js deployable application while organizing backend behavior into domain modules and
frontend behavior into feature folders.

Each backend module owns its controller, service, repository, model, types, and utilities. Shared
contracts, policies, constants, pricing, and HTTP helpers remain centralized only when genuinely
used across layers or modules.

## Consequences

Positive:

- One build, one deployment, and simple local development
- Domain logic remains testable outside route handlers
- Shared transactions and data access remain straightforward
- Module boundaries provide a future extraction path

Trade-offs:

- A failure can affect the whole application
- Cross-module imports require discipline
- Background processing and high-volume device ingestion may eventually need separate workers
- Independent scaling is unavailable until a module is extracted

## Guardrails

- Route handlers stay thin.
- Services own business rules and policy checks.
- Repositories own persistence.
- Modules do not query another module's Mongoose model directly; they call its repository or
  service as appropriate.
- Public projections are explicit and never reuse internal response objects blindly.
