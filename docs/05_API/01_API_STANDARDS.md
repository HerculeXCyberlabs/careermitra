# CareerMitra — API Standards (global conventions)

| | |
|---|---|
| **Version** | 1.0 · **Status** | Approved · **Scope** | Conventions every API contract obeys |
| **Grounded in** | ADR-0008 (Next.js BFF), ADR-0010 (OIDC/JWT + RBAC/ABAC), ADR-0021 (money), `docs/04_Database/` |

> These conventions apply to **every** endpoint in **every** contract doc. Per-surface docs assume them and
> only document their own resources. Read this first. Each decision states **Why** where non-obvious.

---

## 1. Style & topology
- **REST over HTTPS**, JSON only (`application/json`; problems as `application/problem+json`).
- **Base URL:** `https://api.careermitra.in/{version}`. Current: **`/v1`**.
- **BFF pattern (ADR-0008):** the Next.js web app calls a **Backend-for-Frontend** that composes across
  context modules; the same underlying `/v1` contract backs future mobile and a future public API. Contracts
  here describe the logical `/v1` surface; the BFF may aggregate several into one screen response.
- **Resource-oriented:** nouns + HTTP methods; non-CRUD operations use a `:{verb}` suffix sparingly.

## 2. Versioning & compatibility (R8)
- **URL-versioned** (`/v1`, `/v2`). Within a major version, changes are **additive only** (new fields/
  endpoints/optional params). Clients must ignore unknown fields.
- Breaking changes (removing/renaming a field, changing a type, tightening validation) require a **new major
  version** and a published deprecation window — never a silent break. Deprecations are announced via the
  `Deprecation` and `Sunset` response headers.

## 3. Authentication & authorization (ADR-0010)
- **AuthN:** OIDC login → short-lived **JWT** access token, `Authorization: Bearer <jwt>`; refresh rotates.
- **AuthZ:** **RBAC** scopes in the token (e.g. `opportunity.read`, `vault.read`, `review.approve`) + **ABAC**
  context rules evaluated server-side (e.g. an Executive may act only on their assigned `service_request`).
- **Step-up auth:** sensitive actions (Vault access, payments, Form Filling submit) require a recent
  strong-auth assertion; absence → `401 STEP_UP_REQUIRED`.
- **Public endpoints** (discovery, entity profiles, search) are unauthenticated but rate-limited and return
  only verified/published data.
- Scopes and step-up are stated **per endpoint** in each contract.

## 4. Consent (R13) & sensitive-PII (R15)
- Actions on the aspirant's behalf or reads of sensitive-PII require a **valid, purpose-matching consent**,
  passed as `X-Consent-Id: <uuid>` (→ `identity.consent_records`). Missing/invalid → `403 CONSENT_REQUIRED`.
- Sensitive-PII endpoints (Vault, resume content, form data) return **minimal** fields, never document bytes
  or secrets, require step-up, and are **access-logged** server-side (`documents.vault_access_log`).
- Minors: guardian-aware consent enforced server-side; affected endpoints note it.

## 5. Request & response format
- Fields are `snake_case` (parity with DB); timestamps are **RFC 3339 UTC** in `_at` fields; money is
  `{ "amount_minor": <int>, "currency": "INR" }` (ADR-0021); enums are `snake_case` strings matching DB enums.
- **Single resource:** returned as the resource object directly.
- **Collections:** wrapped in a standard envelope with pagination (`§6`):
```json
{
  "data": [ /* resource objects */ ],
  "page": { "cursor_next": "eyJ...", "has_more": true, "page_size": 20 },
  "meta": { "request_id": "req_01H..." }
}
```
- Every response carries `X-Request-Id` for tracing; no PII in headers or logs (R15).

## 6. Pagination, filtering, sorting
- **Cursor pagination** by default (stable under inserts): `?page_size=20&cursor=<opaque>`; response
  `page.cursor_next` / `page.has_more`. **Why cursor:** offset pagination drifts on high-write collections
  (opportunities, alerts). Max `page_size` = 100.
- **Filtering:** `?filter[state]=DL&filter[sector]=central&filter[opportunity_type]=job` — values from
  controlled vocabularies (validated; unknown → `422 INVALID_FILTER`).
- **Sorting:** `?sort=-close_date,title` (`-` = desc) from a per-endpoint allow-list.

## 7. Idempotency (R14-safe writes)
- Unsafe, non-idempotent writes (create order, request service, trigger alert opt-in) require
  `Idempotency-Key: <uuid>`. The server dedups by (key, endpoint, actor) for 24h and returns the original
  result on replay. **Why:** networks retry; money and outbound actions must not double-execute (mirrors the
  DB idempotency invariant, Domain Model §7 rule 14).

## 8. Errors — RFC 7807 problem+json
All failures use `application/problem+json`:
```json
{
  "type": "https://api.careermitra.in/problems/consent-required",
  "title": "Consent required",
  "status": 403,
  "code": "CONSENT_REQUIRED",
  "detail": "This action needs an active consent for purpose 'form_filling'.",
  "request_id": "req_01H...",
  "errors": [ { "field": "documents", "code": "DOCUMENT_MISSING" } ]
}
```
- `code` is a **stable, machine-readable** identifier (clients switch on it, not on `title`/`detail`).
- Standard status usage: `400` malformed · `401` unauthenticated/step-up · `403` authz/consent · `404`
  not found · `409` conflict/version · `422` validation · `429` rate limit · `5xx` server.

### Core error-code catalogue (extended per surface)
| Code | Status | Meaning |
|---|---|---|
| `VALIDATION_FAILED` | 422 | Request failed field validation (`errors[]` details) |
| `INVALID_FILTER` / `INVALID_SORT` | 422 | Unknown/again disallowed query facet |
| `UNAUTHENTICATED` | 401 | Missing/invalid token |
| `STEP_UP_REQUIRED` | 401 | Sensitive action needs recent strong auth |
| `FORBIDDEN` | 403 | Scope/ABAC denies the action |
| `CONSENT_REQUIRED` | 403 | Missing/invalid `X-Consent-Id` for the purpose |
| `NOT_FOUND` | 404 | Resource absent (or not visible to the caller) |
| `VERSION_CONFLICT` | 409 | Optimistic-lock/`If-Match` mismatch |
| `IDEMPOTENCY_CONFLICT` | 409 | Same key, different payload |
| `RATE_LIMITED` | 429 | Tier exceeded; see `Retry-After` |
| `VERIFICATION_PENDING` | 404/409 | Data exists but is not yet verified/published (never leaked as content, R11) |

## 9. Rate limiting
- Per-tier token buckets: **public** (by IP), **authenticated** (by user), **operator**, **service**.
  Exceed → `429 RATE_LIMITED` with `Retry-After` and `RateLimit-*` headers. SMS/alert-triggering and AI
  endpoints have tighter tiers (cost control, PRD §16/§19). Tier stated per endpoint.

## 10. Internationalization
- `Accept-Language` selects the response locale (English/Hindi at launch, then regional). Localized content
  (titles, summaries, alert copy) respects it; dates/numbers are locale-formatted client-side from RFC 3339
  UTC values. Untranslated content falls back to English with a `content_language` field.

## 11. Concurrency
- Mutable aggregates expose `version`; conditional updates use `If-Match: "<version>"` → `409 VERSION_CONFLICT`
  on mismatch (maps to the DB optimistic lock, Overview §3).

## 12. Events are not this API
Domain events (Domain Model §11) are the **internal** integration contract between contexts (Kafka, ADR-0002)
— they are **not** exposed as this public HTTP API. Any external event delivery is a separate, explicitly
designed **webhook** product (out of scope for v1). Do not document internal events as endpoints here.

## 13. Service-to-service
Internal calls between modules are in-process at monolith stage (ADR-0001); when a context extracts, its
`/v1` contract + events become the seam. S2S auth uses mTLS + scoped service tokens (ADR-0010), not user JWTs.
