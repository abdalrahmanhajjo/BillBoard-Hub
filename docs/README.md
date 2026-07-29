# Boardly documentation

This directory is the canonical source of technical and operational documentation. Documents
describe the current implementation; proposed behavior is explicitly marked as future work.

## Start here

1. [Project documentation](PROJECT_DOCUMENTATION.md)
2. [Developer handover](HANDOVER.md)
3. [Architecture overview](architecture/overview.md)
4. [Domain modules](architecture/modules.md)
5. [Data model](architecture/data-model.md)
6. [Local development](guides/development.md)
7. [API reference](reference/api.md)

## Architecture

- [Architecture overview](architecture/overview.md) — boundaries, request flow, runtime model
- [Domain modules](architecture/modules.md) — responsibilities and business rules by module
- [Data model](architecture/data-model.md) — collections, fields, indexes, and relationships
- [Frontend architecture](architecture/frontend.md) — UI composition, forms, motion, accessibility
- [ADR-0001: Modular monolith](adr/0001-modular-monolith.md) — why the current structure exists

## Engineering guides

- [Development](guides/development.md) — setup, workflow, feature implementation
- [Testing](guides/testing.md) — current checks and recommended test layers
- [Deployment](guides/deployment.md) — production preparation and release verification
- [Payments](guides/payments.md) — Stripe Checkout, webhooks, refunds, and offline reconciliation
- [Finance](guides/finance.md) — company expenses, billboard owners, and profitability (admin only)
- [User messages](guides/user-messages.md) — actionable copy, recovery, and accessibility
- [Code cleanliness audit](code-quality/README.md) — verified cleanup, risk register, refactor plan

## Reference

- [API reference](reference/api.md) — routes, authorization, payloads, responses, and statuses
- [Application routes](reference/routes.md) — browser pages and dashboard surfaces
- [Configuration](reference/configuration.md) — environment variables and safe defaults

## Security and operations

- [Authentication and authorization](security/authentication-and-authorization.md)
- [Operations runbook](operations/runbook.md)
- [Release checklist](operations/release-checklist.md)
- [Known limitations and production gaps](known-limitations.md)

## Search and acquisition

- [SEO research and implementation](seo/README.md)
- [Keyword and page map](seo/keyword-map.csv)
- [Content calendar](seo/content-calendar.csv)
- [Competitor analysis](seo/competitor-analysis.md)
- [Prioritized SEO roadmap](seo/roadmap.md)

## Existing collections

- [Billboard Inventory Postman collection](BillBoard-Hub-Billboards-API.postman_collection.json)
- [Public Catalog Postman collection](BillBoard-Hub-Public-Catalog-API.postman_collection.json)

The older inventory and public-catalog markdown references remain available for historical detail,
but the [canonical API reference](reference/api.md) takes precedence where they disagree.

## Documentation standards

- Use repository-relative links.
- Document implemented behavior, not intended behavior.
- Include authorization and error behavior for every endpoint.
- Store all example timestamps in ISO 8601 UTC.
- Never place real secrets, production database names, access tokens, or personal data in examples.
- Update the relevant document in the same change that modifies a contract, route, permission, or
  operational dependency.
