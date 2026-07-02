# CareerMitra — Database Design (`docs/04_Database`)

| | |
|---|---|
| **Product** | CareerMitra — India's AI-powered Government Career Platform |
| **Company** | Astralabs Technologies LLP |
| **Domain** | `04_Database` — schemas, ERDs, data contracts, migration strategy |
| **Version** | 1.0 (in progress) |
| **Status** | Foundation approved · per-context schemas landing incrementally |
| **Last updated** | 2026-07-01 |
| **Grounded in** | `docs/01_Domain/DOMAIN_MODEL.md`, `docs/02_Architecture/05_DATA_ARCHITECTURE.md`, `PROJECT_MANIFEST.json`, `PROJECT_RULES.md` |
| **Scope** | Logical + physical database design for the PostgreSQL write models. **No** application code, ORM entities, or migration files (those live in `apps/`/`modules/`). |

> This is the database single source of truth. It turns the **Domain Model** (business entities) and
> the **Data Architecture** (where data lives) into concrete PostgreSQL **schemas, tables, columns,
> keys, indexes, and constraints**. Every table maps back to a domain entity; every rule here realizes
> a `PROJECT_RULES.md` rule or a Domain Model invariant. It never contradicts them — it implements them.

---

## 1. What lives here

The Data Architecture doc deliberately stopped at *"no SQL/schema."* This domain is where that gap is
filled. It covers the **transactional write models in PostgreSQL** — the source of truth. Derived read
models (OpenSearch index, vector store, cache projections, lakehouse) are **rebuildable from events**
and are specified in their own architecture docs (`06_SEARCH`, `07_AI`, `05_DATA_ARCHITECTURE`), not here.

## 2. Reading order

1. **`01_SCHEMA_OVERVIEW.md`** — the global conventions that govern **every** schema (schema-per-context,
   id strategy, standard columns, no cross-context FKs, encryption, outbox, history, enums, indexing,
   partitioning, migrations, data classification). **Read this first — the per-context docs assume it.**
2. The per-context schema docs (one per bounded context, numbered to match the Domain Model's context order).

## 3. Schema catalogue (one PostgreSQL schema per bounded context)

| # | Doc | Postgres schema | Bounded context (Domain Model §) | Status |
|---|---|---|---|---|
| 01 | `01_SCHEMA_OVERVIEW.md` | — | Global conventions | ✅ Written |
| 02 | `02_REFERENCE_SCHEMA.md` | `reference` | 2 · Reference & Canonical (shared kernel) | ✅ Written |
| 03 | `03_RECRUITMENT_SCHEMA.md` | `recruitment` | 3 · Recruitment | ✅ Written |
| 04 | `04_IDENTITY_SCHEMA.md` | `identity` | 1 · Identity & Access | ✅ Written |
| 05 | `05_CAREER_SCHEMA.md` | `career` | 4 · Career & Journey | ✅ Written |
| 06 | `06_DOCUMENTS_SCHEMA.md` | `documents` | 5 · Documents & Vault (sensitive-PII) | ✅ Written |
| 07 | `07_AI_SCHEMA.md` | `ai` | 6 · AI & Intelligence | ✅ Written |
| 08 | `08_SEARCH_SCHEMA.md` | `search` | 7 · Search & Discovery (read-model metadata) | ✅ Written |
| 09 | `09_PAYMENTS_SCHEMA.md` | `payments` | 8 · Payments & Billing | ✅ Written |
| 10 | `10_SERVICES_SCHEMA.md` | `services` | 9 · Professional Services (Form Filling) | ✅ Written |
| 11 | `11_CRAWLER_SCHEMA.md` | `crawler` | 10 · Crawler & Ingestion | ✅ Written |
| 12 | `12_CONTENT_SCHEMA.md` | `content` | 11 · Content & SEO | ✅ Written |
| 13 | `13_ADMIN_SCHEMA.md` | `admin` | 12 · Administration & Governance (audit) | ✅ Written |
| 14 | `14_SUPPORT_SCHEMA.md` | `support` | 13 · Support & Trust | ✅ Written |
| 15 | `15_ANALYTICS_SCHEMA.md` | `analytics` | 14 · Analytics & Insights | ✅ Written |
| 16 | `16_GROWTH_SCHEMA.md` | `growth` | 15 · Growth & Partnerships | ✅ Written |
| 17 | `17_NOTIFICATIONS_SCHEMA.md` | `notifications` | 16 · Notifications & Engagement | ✅ Written |

> All 16 context schemas are drafted (v1.0). The two foundational ones (`reference`, `recruitment`) are
> the reference implementations; every other schema follows the same template (see `Examples.md`) and
> references their canonical ids without cross-context foreign keys.

## 4. Numbering note (taxonomy)

`PROJECT_MANIFEST.json → documentationDomains` reserves the code `04_Database` for this domain; this
folder claims it. Note the manifest's idealized taxonomy (`03_Architecture`, `04_Database`, …) is
offset by one from the on-disk numbering (Architecture physically lives at `02_Architecture`). No
document references `docs/04_Database` yet, so this placement introduces **no dangling links**. The
manifest ↔ on-disk numbering reconciliation is tracked as a governance-hygiene item and should be
resolved via the documented process, not by silently renumbering here.

## 5. Related documents

- Business entities & invariants → `docs/01_Domain/DOMAIN_MODEL.md`
- Where data lives, ownership, polyglot persistence, backups → `docs/02_Architecture/05_DATA_ARCHITECTURE.md`
- Search index & vector store → `docs/02_Architecture/06_SEARCH_ARCHITECTURE.md`
- Security, encryption, audit posture → `docs/02_Architecture/09_SECURITY_ARCHITECTURE.md`
- Binding rules (R11 provenance, R14–R17 security/PII) → `PROJECT_RULES.md`
