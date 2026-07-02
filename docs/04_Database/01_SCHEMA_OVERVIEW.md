# CareerMitra — Database Schema Overview (global conventions)

| | |
|---|---|
| **Version** | 1.0 · **Status** | Approved · **Scope** | Conventions governing every context schema |
| **Grounded in** | `docs/01_Domain/DOMAIN_MODEL.md`, `docs/02_Architecture/05_DATA_ARCHITECTURE.md`, `PROJECT_RULES.md` |

> These conventions apply to **every** table in **every** context schema. Per-context docs (`02`–`17`)
> assume them and only document their own tables. Read this first. Each decision states **Why / Trade-off**
> in the Architecture style. Illustrative DDL is PostgreSQL 16+; final migration files live with the code.

---

## 1. Engine & topology
- **Engine:** PostgreSQL (Tech Stack §5) — ACID, relational integrity for money/identity/recruitment,
  `jsonb` for flexible fields, `pgvector` for early semantic search, mature HA/PITR.
- **One schema per bounded context** in a single database at MVP: `identity, reference, recruitment,
  career, documents, ai, search, payments, services, crawler, content, admin, support, analytics, growth,
  notifications` (16, matching Domain Model §3).
  - **Why one DB, many schemas:** context isolation (each schema is a clean seam) without the operational
    tax of 16 databases at pre-scale. **Trade-off:** shared instance resources — accepted until a context
    needs independent scaling. **Future:** a schema lifts to its own database/instance on service
    extraction (Architecture §16) with its boundary already intact.
- **`reference` is the shared kernel.** It is the *only* schema other contexts reference by id.

## 2. The cross-context boundary rule (the most important rule here)
**A foreign-key constraint may only reference a table in the same schema.** Cross-context relationships
are stored as bare canonical `uuid`s with **no** database FK, and validated at the application boundary.

- **Why:** DB-level cross-context FKs would weld the contexts together, making the future service split a
  rewrite instead of a move, and would violate "no cross-context shared tables" (Domain Model §10).
- **How it reads:** `recruitment.opportunities.organization_id` is a `uuid` documented as *"canonical id →
  `reference.organizations` (no FK; validated in app; resolved via Reference)."*
- **Integrity instead of FKs:** cross-context references are validated on write (the id must resolve via
  the owning context/Reference), and stale references are tolerated by design (events reconcile them).
- **Trade-off:** the database will not enforce cross-context referential integrity — the application and
  events must. This is the deliberate price of extractability.

## 3. Standard columns (every table)
| Column | Type | On which tables | Purpose |
|---|---|---|---|
| `id` | `uuid` (UUIDv7) | all | Primary key. Time-ordered → index-friendly, globally unique across contexts/future services. |
| `created_at` | `timestamptz` | all | Row creation (UTC). |
| `updated_at` | `timestamptz` | mutable tables | Last modification (UTC). **Omitted on append-only tables.** |
| `version` | `integer` | mutable **aggregate roots** | Optimistic concurrency (increment on update; reject stale writes). |
| `deleted_at` | `timestamptz` null | tables needing soft delete | Soft delete for recoverable/retention-bound data. **Omitted on append-only tables and on data purged for data-rights.** |
| `status` | `enum` | entities with a lifecycle | Current lifecycle state (values = the Domain Model lifecycle). |

- **IDs — Why UUIDv7 not bigserial:** no cross-context/cross-service collisions, no sequence coordination,
  safe to generate app-side before insert (needed for the outbox pattern), yet time-sortable (avoids the
  index fragmentation of UUIDv4). **Trade-off:** 16 bytes vs 8 — accepted. Public SEO surfaces use a
  separate human-readable `slug`, never the raw id.
- **Soft vs hard delete:** soft delete (`deleted_at`) for aspirant-recoverable and retention-bound data;
  **hard delete** for data-rights erasure (PRD §34) — a soft flag does not satisfy a deletion request.

## 4. Enumerations & controlled vocabularies
- **Closed lifecycle/status sets** (won't change without a code change) → **native PostgreSQL `enum`
  types**, one per attribute, named `<subject>_<attribute>` (e.g., `recruitment.recruitment_status`).
  Values are exactly the Domain Model lifecycle states. **Why enums:** type safety + tiny storage.
  **Trade-off:** adding a value needs a migration — acceptable for genuinely closed sets.
- **Governed, ops-extendable vocabularies** (skill categories, reservation categories, qualification
  levels, source categories, pay levels) → **lookup tables** in the owning schema, referenced by FK
  (same-context) or canonical id (cross-context). **Why:** content-ops can extend them without a deploy.
- Every enum/vocabulary maps to the "controlled vocabulary" the Domain Model calls for; free text where a
  canonical value should exist is a defect (Domain Model §7 rule 3).

## 5. Event integration — the transactional outbox
Contexts integrate via **domain events** (Domain Model §11), never shared tables. To publish events
atomically with state changes:

- Each schema has an append-only **`outbox_events`** table written in the **same transaction** as the
  aggregate change. A relay process publishes rows to the Kafka-compatible backbone and marks them sent.
- Consumers keep an **`inbox_events`** (processed-event) table for **idempotency** (Domain Model §7 rule
  14; events are replay-safe).

```sql
CREATE TABLE recruitment.outbox_events (
    id            uuid PRIMARY KEY,              -- event id (UUIDv7)
    aggregate_type text        NOT NULL,          -- 'Opportunity'
    aggregate_id  uuid         NOT NULL,
    event_type    text         NOT NULL,          -- 'OpportunityPublished'
    event_version integer      NOT NULL DEFAULT 1,
    payload       jsonb        NOT NULL,          -- ids + minimal metadata ONLY — never sensitive PII
    occurred_at   timestamptz  NOT NULL,
    published_at  timestamptz  NULL               -- set by the relay when dispatched
);
CREATE INDEX ix_outbox_events_unpublished ON recruitment.outbox_events (occurred_at)
    WHERE published_at IS NULL;
```
- **Event payloads carry ids and minimal metadata — never sensitive-PII payloads** (Domain Model §11.2,
  R15). This is a review checkpoint on every event.

## 6. Sensitive PII — field-level (envelope) encryption
Data classified **sensitive-pii** (Domain Model §5.5, Data Architecture §6) — Vault document content,
resume content, parsed-resume fields, form-fill data, category, DOB — is never stored in plaintext.

- **Document bytes** live in **object storage** (encrypted, S3-compatible); the DB stores only metadata,
  an integrity `checksum`, and an encrypted storage reference.
- **Sensitive scalar fields** use **envelope encryption**: a per-record Data Encryption Key (DEK) is
  wrapped by a KMS-managed Key Encryption Key. The column pattern is:

| Column | Type | Purpose |
|---|---|---|
| `<field>_ciphertext` | `bytea` | AEAD ciphertext of the value |
| `<field>_dek_id` | `uuid` | reference to the wrapped DEK (key registry) |
| `<field>_enc_alg` | `text` | algorithm/version tag (e.g., `aes-256-gcm`) for rotation |

- **Why app-layer envelope, not `pgcrypto`:** key management, rotation, and per-record keys are the hard
  part; envelope encryption with KMS keeps keys out of the database entirely (R14 — no secrets in DB).
  **Trade-off:** encrypted columns are not queryable/indexable — sensitive fields are therefore never
  filter keys; queryable derived signals (e.g., an eligibility verdict) are computed and stored separately.
- **Access is logged:** every read/write of Vault/Document data appends a `documents.vault_access_log`
  row with actor, purpose, and consent reference (R15; Domain Model §5.5). No sensitive read path bypasses it.

## 7. Provenance & the verification gate (data-trust columns)
Every user-visible recruitment fact traces to its source and passes review (R11; Domain Model §7 rules 1–2).

- Published tables (`recruitments`, `opportunities`, `results`, `cutoffs`, `government_schemes`, …) carry
  `source_id` + `notification_id` (canonical/Crawler ids), `verified_at`, `verified_by` (operator id),
  and `published_at`.
- **A row is user-visible only when its verification columns are set and `status` is a published state.**
  Read models and APIs filter on this; it is the schema expression of "no unverified data ships."
- **Trade-off:** a little denormalization (provenance repeated per published table) — accepted because the
  provenance guarantee must be local to every fact.

## 8. History & trends (captured from day one)
Trends cannot be reconstructed later (Principle 8 / PRD §11), so capture is structural:

- **Append-only snapshot tables** (`recruitment.cutoff_history`, `recruitment.vacancy_snapshots`,
  `recruitment.recruitment_history`) are written on the corresponding domain events (`CutoffRecorded`,
  `VacancyUpdated`, `OpportunityPublished`). They are immutable and time-stamped.
- The same events also flow to the **lakehouse** for analytics; the Postgres snapshots are the
  verifiable, provenance-linked system of record for on-profile trend widgets.

## 9. Indexing conventions
- Every FK column is indexed. Every common filter/sort path gets a composite index (e.g.,
  `ix_opportunities_status_close_date`). Full-text/faceted search is **not** done in Postgres — it is the
  OpenSearch read model (Search Architecture §06); Postgres indexes serve OLTP access, not discovery.
- Partial indexes for hot predicates (e.g., unpublished outbox rows, active/published rows).
- Unique constraints enforce canonical-identity rules (e.g., `ux_organizations_canonical_name`).

## 10. Partitioning & scale (staged, YAGNI-first)
- **Range-partition by time** the high-volume append tables: `notifications.alerts`,
  `analytics.analytics_events`, `admin.audit_log`, `crawler.raw_documents`, and the outbox tables.
- Read replicas for read-heavy contexts; CQRS read models offload discovery/dashboards/trends (Data
  Architecture §9). **Sharding only when metrics demand it** — no premature partitioning of low-volume
  contexts. **Future:** per-context databases on extraction; regional partitioning for multi-region.

## 11. Migrations
- **Forward-only, versioned, reviewed.** Sequential files `NNNN_<description>.sql` shipped with the owning
  module; expand-then-contract for breaking changes (add column → backfill → switch → drop) so deploys are
  zero-downtime. The migration tool is **ADR-gated** (`docs/10_ADR`) — this doc defines the *target* schema
  and the *strategy*, not the tool choice.
- Every migration is reversible where safe and leaves an auditable trail (R10 spirit). Destructive changes
  to sensitive-PII tables require Security Review (R16).

## 12. Data classification (documented per column, not stored)
Every column is tagged in its context doc with one class (Manifest `dataSensitivityLevels`):
`public` · `internal` · `pii` · `sensitive-pii` · `secret`. Classification drives handling — encryption,
logging bans, retention, access — but is **documentation**, not a database column. **No `secret`-class
data is ever stored in PostgreSQL** (keys live in the secrets manager, R14).

## 13. Standard table template (illustrative)
```sql
CREATE TABLE reference.exams (
    id              uuid        PRIMARY KEY,               -- UUIDv7, app-generated
    canonical_name  text        NOT NULL,
    status          reference.entity_status NOT NULL DEFAULT 'draft',
    version         integer     NOT NULL DEFAULT 1,        -- optimistic lock
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz NULL
);
```
Every per-context doc documents its tables as **(column, type, null, class, notes)**, plus keys, indexes,
constraints, and the domain entity each table maps to.
