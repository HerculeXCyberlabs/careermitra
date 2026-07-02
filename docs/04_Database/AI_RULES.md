# AI_RULES — `docs/04_Database`

Rules any AI tool (Claude Code, Cursor, Copilot, Gemini, …) must follow when generating or modifying
database design in this domain. Inherits `AI_INSTRUCTIONS.md` and `PROJECT_RULES.md`; where they
conflict, those win.

## Before you write
1. Read `01_SCHEMA_OVERVIEW.md` — it defines the conventions every table must follow. Do not restate or
   fork them per file; link to them.
2. Read the relevant context in `docs/01_Domain/DOMAIN_MODEL.md §5`. **Every table maps to a documented
   domain entity.** Do not invent entities; if the model lacks something you need, flag it and propose a
   Domain Model update — do not silently add it here.
3. Use the Ubiquitous Language exactly (`docs/01_Domain/UBIQUITOUS_LANGUAGE.md`). `Notification` = the
   official announcement (Recruitment); an outbound message is an `Alert` (Notifications). Never mix them.

## Hard rules (never violate)
- **No cross-context foreign keys.** A table in schema `X` may FK only to tables in schema `X`. References
  to another context are bare canonical `uuid`s validated in the application, never DB-level FKs. This is
  what keeps contexts extractable (Architecture §16, Domain Model §10).
- **Provenance is mandatory on published facts.** Any table holding user-visible Opportunity/Recruitment/
  Result/Cutoff/Scheme data carries `source_id`, `notification_id`, and verification columns. A design that
  can display an unverified date/eligibility is an **R11 severity-1 defect**.
- **Sensitive PII is never stored in plaintext.** Vault document content, resume content, parsed-resume
  fields, form-fill data, category, and DOB use the envelope-encryption column pattern (Overview §6) or
  live in object storage with only encrypted references in the DB. Never add a plaintext column for them.
- **No secrets or real PII in this documentation.** Examples use synthetic, obviously-fake values only
  (R14). No sample Aadhaar numbers, real names, real emails, or credentials — ever, including in fixtures.
- **Append-only means append-only.** Audit logs, access logs, stage histories, event outbox, and history/
  trend tables have no `UPDATE`/`DELETE` grants and no `updated_at`/soft-delete. Model them that way.
- **Consent and audit are structural.** Sensitive-PII tables reference the consent model and emit access
  log rows; do not design a sensitive read path that bypasses `vault_access_log`/`audit_log`.

## Discipline
- Every mutable aggregate root gets `id, created_at, updated_at, version` and, where soft delete applies,
  `deleted_at`. Every table declares its **data classification** per column in the doc (public / internal /
  pii / sensitive-pii / secret) — classification drives handling, not a stored column.
- Prefer real, queryable columns for canonical/filterable fields; use `jsonb` only for genuinely
  semi-structured or snapshot data (extracted fields, event payloads, denormalized facets).
- Money is stored as integer minor units (`amount_minor bigint`) + `currency char(3)` — never float.
- All timestamps are `timestamptz` in UTC.
- Any schema change that touches Documents/Vault, Resume Parser, Form Filling, identity/auth, or the
  ingestion trust boundary requires **Security Review** (R16) — state this in the change.
- No placeholders/TODO in files destined for `main` (R9). If a context schema is not yet designed, leave
  it out of the catalogue as "Planned" rather than committing an empty stub.
