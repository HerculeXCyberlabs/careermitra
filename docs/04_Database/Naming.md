# Naming — `docs/04_Database`

Naming rules for database objects. These extend `PROJECT_RULES.md §R7`. Database identifiers use
`snake_case` (SQL convention), distinct from source files (`kebab-case`) and TypeScript types
(`PascalCase`). The full rationale for each choice is in `01_SCHEMA_OVERVIEW.md`.

## Documents in this folder
- Overview: `01_SCHEMA_OVERVIEW.md` (PascalCase per R7).
- Per-context schema docs: `NN_<CONTEXT>_SCHEMA.md` — number matches the catalogue in `README.md`.

## Database objects
| Object | Convention | Example |
|---|---|---|
| Schema (one per bounded context) | `snake_case`, singular context noun | `reference`, `recruitment`, `career`, `notifications` |
| Table | `snake_case`, **plural** | `reference.organizations`, `recruitment.opportunities` |
| Column | `snake_case`, singular | `canonical_name`, `verified_at`, `organization_id` |
| Primary key | always `id` (`uuid`, UUIDv7) | `id` |
| Foreign key (same context) | `<referenced_singular>_id` + real FK constraint | `recruitment_id` → `recruitment.recruitments(id)` |
| Cross-context canonical reference | `<entity>_id` (`uuid`), **no FK constraint** | `organization_id` (Reference), `profile_id` (Career) |
| Enum type | `snake_case`, `<subject>_<attribute>` | `recruitment_status`, `alert_channel` |
| Lookup/vocabulary table | `snake_case` plural, suffix intent | `reservation_categories`, `qualification_levels` |
| Index | `ix_<table>_<cols>` | `ix_opportunities_status_close_date` |
| Unique index / constraint | `ux_<table>_<cols>` | `ux_organizations_canonical_name` |
| Check constraint | `ck_<table>_<rule>` | `ck_recruitments_date_coherence` |
| Foreign-key constraint | `fk_<table>_<referenced>` | `fk_vacancies_post` |
| Partition (time) | `<table>_yYYYY[mMM]` | `alerts_y2026m07` |
| Outbox table (per schema) | `outbox_events` | `recruitment.outbox_events` |
| History/snapshot table | `<subject>_history` or `<subject>_snapshots` | `cutoff_history`, `vacancy_snapshots` |

## Standard column names (used everywhere; see Overview §3)
`id` · `created_at` · `updated_at` · `deleted_at` (soft delete where applicable) · `version` (optimistic
lock on mutable aggregates) · `status` · `data_class` is **not** a column — classification is documented
per column, not stored.

## Provenance & verification columns (published recruitment facts)
`source_id` · `notification_id` · `verified_at` · `verified_by` (operator user id) · `published_at`.

## Encrypted sensitive-PII columns (see Overview §6)
`<field>_ciphertext` (`bytea`) · `<field>_dek_id` (`uuid`, key reference) · `<field>_enc_alg` (`text`).
Never a plaintext `<field>` column alongside them.

## Forbidden
- No plural/singular mixing within a context.
- No abbreviations that aren't in `docs/01_Domain/BUSINESS_GLOSSARY.md` (`org` ✗ → `organization` ✓).
- No cross-context foreign-key constraints (integration is event-driven — Overview §5).
- No column named after a synonym of a glossary term (use `opportunity_id`, never `listing_id`/`job_id`).
