# Examples — `docs/04_Database`

Worked examples showing the expected shape of database design in this domain. Copy these patterns when
adding a per-context schema doc. Full conventions: `01_SCHEMA_OVERVIEW.md`.

## 1. Per-context schema doc — required structure
Every `NN_<CONTEXT>_SCHEMA.md` contains, in order:
1. Header table (Postgres schema, context §, version/status, "Assumes Overview").
2. **ER overview** — a Mermaid diagram of the schema's tables.
3. **Enums** — native enum types (closed sets) and governed lookup tables.
4. **Tables** — each as a `(column, type, null, class, notes)` table, plus keys, constraints, indexes,
   and the Domain Model entity it maps to.
5. **Outbox** — events this context emits and their consumers.
6. **Invariants realized** — which `PROJECT_RULES.md` / Domain Model §7 rules this schema enforces and how.

See `02_REFERENCE_SCHEMA.md` (shared kernel) and `03_RECRUITMENT_SCHEMA.md` (core, with provenance +
history) as the two reference implementations.

## 2. Standard columns (never re-explained per table — just present)
```sql
id          uuid        PRIMARY KEY,                 -- UUIDv7
version     integer     NOT NULL DEFAULT 1,          -- mutable aggregate roots only
created_at  timestamptz NOT NULL DEFAULT now(),
updated_at  timestamptz NOT NULL DEFAULT now(),      -- omit on append-only tables
deleted_at  timestamptz NULL                         -- soft delete where applicable
```

## 3. Cross-context reference (bare id, NO foreign key)
```sql
-- in schema `career`
CREATE TABLE career.saved_jobs (
    id             uuid PRIMARY KEY,
    profile_id     uuid NOT NULL REFERENCES career.profiles(id),  -- same-context FK ✓
    opportunity_id uuid NOT NULL,   -- canonical id -> recruitment.opportunities (NO FK; validated in app) ✓
    saved_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_saved_jobs_profile ON career.saved_jobs (profile_id);
```
> `opportunity_id` deliberately has **no** `REFERENCES recruitment.opportunities` — that would be a
> cross-context FK (forbidden, Overview §2). The application validates the id; events keep it reconciled.

## 4. Sensitive-PII column (envelope encryption, never plaintext)
```sql
-- in schema `documents` — a resume's parsed content is sensitive-pii
category_ciphertext bytea NOT NULL,   -- AEAD ciphertext
category_dek_id     uuid  NOT NULL,   -- wrapped DEK reference (KMS-managed)
category_enc_alg    text  NOT NULL    -- 'aes-256-gcm'
-- NO plaintext `category` column exists. Encrypted columns are never filter/index keys.
```

## 5. Append-only table (audit / history / stage transitions)
```sql
CREATE TABLE career.application_stage_history (
    id             uuid PRIMARY KEY,
    application_id uuid NOT NULL REFERENCES career.applications(id),
    from_stage     text NOT NULL,
    to_stage       text NOT NULL,
    actor          text NOT NULL,          -- 'self' | 'system' | operator id
    note           text NULL,
    at             timestamptz NOT NULL DEFAULT now()
    -- no updated_at, no deleted_at; INSERT-only (no UPDATE/DELETE grants)
);
```

## 6. Money (integer minor units, never float)
```sql
amount_minor bigint  NOT NULL,   -- e.g., 49900 = ₹499.00
currency     char(3) NOT NULL    -- ISO 4217, e.g., 'INR'
```

## 7. Constraint expressing a Domain Model invariant
```sql
-- Domain Model §7 rule 15: open <= close <= exam <= result
ALTER TABLE recruitment.recruitments
  ADD CONSTRAINT ck_recruitments_date_coherence
  CHECK (
    (open_date  IS NULL OR close_date  IS NULL OR open_date  <= close_date)  AND
    (close_date IS NULL OR exam_date   IS NULL OR close_date <= exam_date)   AND
    (exam_date  IS NULL OR result_date IS NULL OR exam_date  <= result_date)
  );
```

## 8. Anti-examples (rejected in review)
| ✗ Don't | ✓ Do |
|---|---|
| `opportunity_id uuid REFERENCES recruitment.opportunities(id)` from another schema | bare `uuid`, validated in app (§3) |
| `organization_name text` on an opportunity | `organization_id uuid` → canonical `reference` id |
| `dob date` in plaintext | `dob_ciphertext`/`dob_dek_id`/`dob_enc_alg` (§4) |
| `price float` | `amount_minor bigint` + `currency char(3)` (§6) |
| `UPDATE`-able audit/history rows | append-only, INSERT-only grants (§5) |
| `listing_id` / `job_id` / `post` (synonyms) | `opportunity_id` (Ubiquitous Language) |
| Native enum for skill categories (ops must extend) | lookup table (Overview §4) |
