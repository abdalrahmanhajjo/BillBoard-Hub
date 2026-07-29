@AGENTS.md

# CLAUDE Project Notes

This file references `AGENTS.md` as the source of truth for architecture and implementation rules.

## Local Expectations

1. Follow feature-based frontend boundaries.
2. Follow module-based backend boundaries.
3. Keep route handlers thin.
4. Reuse the service layer from both Server Actions and API routes.
5. Add or update docs when introducing a new module or workflow.

## Auth and Security Notes

1. Auth.js v5 with database sessions is the selected strategy.
2. Credentials provider is the default provider for MVP.
3. Middleware plus service-level policy checks are mandatory.
4. Never store plain passwords; always hash with bcrypt.
5. Middleware runs in Edge runtime; avoid importing Node-only auth adapter code there.
