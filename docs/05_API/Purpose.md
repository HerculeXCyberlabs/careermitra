# Purpose — `docs/05_API`

## Why this domain exists
The API is the **contract boundary** of CareerMitra — where the trust, privacy, and grounding promises are
enforced at the edge, before any client sees data. This domain defines that contract so that:

- **Clients build against a stable, versioned surface.** The web BFF (ADR-0008), future mobile, and a
  future public/partner API all consume one documented, URL-versioned contract (`/v1`).
- **The rules are enforced at the boundary, not just deep in code.** Verified-only reads (R11), grounded AI
  responses with citations (R12), consent-gated actions (R13), and PII minimization (R15) are expressed as
  contract obligations — request/response shapes, required headers, error codes.
- **The contract precedes the code.** API-first (Architecture §3): the shape is agreed here, then
  implemented in `modules/`/`apps/`, and validated against an OpenAPI spec generated from these contracts.
- **Errors are predictable.** One RFC 7807 problem format and a governed error-code catalogue mean clients
  handle failures consistently across every surface.

## What this domain owns
- Resource models (request/response field shapes), endpoints, methods, status codes, error codes.
- Auth requirements per endpoint (scopes, step-up, consent).
- Pagination, filtering, sorting, idempotency, rate-limit, and i18n conventions.
- Versioning and deprecation policy for live contracts.

## What it does NOT own
- **Controller/handler/router code** → the owning `modules/<context>/adapters/inbound`.
- **Persistence** → `docs/04_Database`. The API never exposes raw table shapes; it exposes resource models.
- **Search index internals / event schemas** → Search/Data architecture docs; events are an internal
  contract, not this HTTP API (see `01_API_STANDARDS.md §events`).

## Success criteria
A contract here is correct when: every resource maps to a Domain Model entity; no endpoint can return
unverified opportunity data (R11); every sensitive-PII endpoint requires step-up auth + consent and logs
access (R15); every AI endpoint returns grounding/citation fields (R12); errors use the shared problem
format; and breaking changes are versioned, never silent (R8).
