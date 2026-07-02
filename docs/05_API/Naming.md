# Naming — `docs/05_API`

Extends `PROJECT_RULES.md §R7` and Manifest `conventions`. HTTP/JSON conventions below; full rationale in
`01_API_STANDARDS.md`.

## Documents
- Standards: `01_API_STANDARDS.md`. Per-surface contracts: `NN_<SURFACE>_API.md` (see `README.md` catalogue).

## URLs & resources
| Item | Convention | Example |
|---|---|---|
| Base URL | `/{version}` URL-versioned | `/v1` |
| Resource collection | plural, `kebab-case`, noun | `/v1/opportunities`, `/v1/saved-jobs` |
| Resource item | collection + id | `/v1/opportunities/{opportunityId}` |
| Sub-resource | nested under parent | `/v1/applications/{applicationId}/stages` |
| Path parameter | `camelCase` in braces | `{opportunityId}`, `{examId}` |
| Action (non-CRUD) | verb sub-path, sparingly | `/v1/service-requests/{id}:submit` |
| Public SEO entity | by `slug`, not id | `/v1/exams/{slug}`, `/v1/organizations/{slug}` |

Use **glossary terms** in paths — `opportunities`, never `jobs`/`listings` (Ubiquitous Language).

## JSON fields
| Item | Convention | Example |
|---|---|---|
| Field name | `snake_case` | `close_date`, `profile_score`, `organization_id` |
| Id field | `<entity>_id` (matches DB) | `opportunity_id` |
| Timestamp | RFC 3339 UTC, suffix `_at` | `published_at`, `created_at` |
| Money | object `{ amount_minor, currency }` (ADR-0021) | `{ "amount_minor": 49900, "currency": "INR" }` |
| Enum value | `snake_case` string (matches DB enum) | `"closing_soon"`, `"in_app"` |
| Boolean | `is_`/`has_` prefix | `is_pwd`, `has_scorecard` |

## Query parameters
`snake_case`: `page`, `page_size`, `sort`, `filter[<field>]`, `q` (search), `locale`. See standards §pagination/filtering.

## Headers
- `Authorization: Bearer <jwt>` · `Idempotency-Key: <uuid>` (unsafe writes) · `Accept-Language: hi-IN`
  · `X-Consent-Id: <uuid>` (sensitive-PII actions) · `X-Request-Id` (tracing).

## Error codes
Stable, `SCREAMING_SNAKE_CASE`, namespaced by domain: `OPPORTUNITY_NOT_FOUND`, `CONSENT_REQUIRED`,
`ELIGIBILITY_INSUFFICIENT_DATA`, `VERIFICATION_PENDING`. Catalogue in `01_API_STANDARDS.md §errors`.

## Forbidden
- No verbs in CRUD resource paths (`/getOpportunity` ✗ → `GET /opportunities/{id}` ✓).
- No `camelCase` JSON fields (keep parity with DB `snake_case`).
- No un-versioned breaking changes (R8) — new major → `/v2`.
- No synonym resources (`/jobs`, `/posts`, `/listings` ✗ → `/opportunities` ✓).
