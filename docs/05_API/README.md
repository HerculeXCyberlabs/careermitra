# CareerMitra — API Contracts (`docs/05_API`)

| | |
|---|---|
| **Product** | CareerMitra — India's AI-powered Government Career Platform |
| **Domain** | `05_API` — HTTP API contracts, endpoints, error codes, conventions |
| **Version** | 1.0 (in progress) |
| **Status** | Foundation approved · per-surface contracts landing incrementally |
| **Last updated** | 2026-07-01 |
| **Grounded in** | `docs/01_Domain/DOMAIN_MODEL.md`, `docs/04_Database/`, `docs/02_Architecture/03_APPLICATION_ARCHITECTURE.md`, ADR-0008 (Next.js BFF), ADR-0010 (OIDC/JWT + RBAC/ABAC) |
| **Scope** | The contract only — request/response shapes, auth, errors, versioning. **No** controller/handler code (that lives in `modules/`/`apps/`). |

> This is the API single source of truth: the boundary contract between clients (web BFF, future mobile,
> future public API) and the platform. It is **API-first** — the contract is defined here before
> implementation (Architecture §3). Every resource maps to a Domain Model entity and a `docs/04_Database`
> table; every rule (R11 verified-only, R12 grounded, R13 consent, R15 PII) is expressed as a contract
> obligation. `01_API_STANDARDS.md` governs all contracts — read it first.

---

## 1. Reading order
1. **`01_API_STANDARDS.md`** — versioning, auth, error format (RFC 7807), pagination, filtering,
   idempotency, rate limiting, consent, i18n, and the response envelope. **Every contract assumes it.**
2. The per-surface contract docs below.

## 2. Contract catalogue
APIs are grouped by **surface** (aligned to bounded contexts; the web BFF composes across them).

| # | Doc | Primary context(s) | Audience | Status |
|---|---|---|---|---|
| 01 | `01_API_STANDARDS.md` | all | — | ✅ Written |
| 02 | `02_AUTH_CONSENT_API.md` | Identity & Access (1) | Aspirant | ✅ Written |
| 03 | `03_DISCOVERY_API.md` | Recruitment (3), Reference (2), Content (11) | Public / Aspirant | ✅ Written |
| 04 | `04_SEARCH_API.md` | Search & Discovery (7) | Public / Aspirant | ✅ Written |
| 05 | `05_PROFILE_API.md` | Career & Journey (4) | Aspirant | ✅ Written |
| 06 | `06_DOCUMENTS_API.md` | Documents & Vault (5) | Aspirant · **sensitive-PII** | ✅ Written |
| 07 | `07_AI_API.md` | AI & Intelligence (6) | Aspirant | ✅ Written |
| 08 | `08_NOTIFICATIONS_API.md` | Notifications & Engagement (16) | Aspirant | ✅ Written |
| 09 | `09_PAYMENTS_API.md` | Payments & Billing (8) | Aspirant | ✅ Written |
| 10 | `10_SERVICES_API.md` | Professional Services (9) | Aspirant · Executive | ✅ Written |
| 11 | `11_ADMIN_API.md` | Administration (12), Crawler ops (10) | Operator | ✅ Written |
| 12 | `12_SUPPORT_TRUST_API.md` | Support & Trust (13) | Aspirant · Operator | ✅ Written |
| 13 | `13_GROWTH_CONTENT_API.md` | Growth (15), Content (11), Analytics (14) | Mixed | ✅ Written |

> Analytics event ingestion and internal service-to-service contracts are covered inline in
> `13_GROWTH_CONTENT_API.md §Analytics` and `01_API_STANDARDS.md §service-to-service`.

## 3. Conventions at a glance (full detail in `01_API_STANDARDS.md`)
- **Base:** `https://api.careermitra.in/v1` · URL-versioned (Manifest `apiVersioning`, ADR-0008 BFF fronts it).
- **Auth:** OIDC + short-lived JWT bearer; RBAC scopes + ABAC context rules (ADR-0010). Step-up for Vault/pay.
- **Errors:** RFC 7807 `application/problem+json` with a stable `code` catalogue.
- **Format:** JSON; `snake_case` request/response fields; `timestamptz` as RFC 3339 UTC; money as
  `{ amount_minor, currency }` (ADR-0021).
- **Verified-only:** public discovery endpoints return only published, verified data (R11).

## 4. Related
- Data these contracts expose → `docs/04_Database/`
- Business entities & rules → `docs/01_Domain/DOMAIN_MODEL.md`
- Application/BFF architecture → `docs/02_Architecture/03_APPLICATION_ARCHITECTURE.md`
- Decisions → `docs/10_ADR/`, `docs/02_Architecture/14_DECISION_RECORDS.md`
