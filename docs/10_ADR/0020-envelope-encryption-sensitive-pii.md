# ADR-0020 — Envelope encryption for sensitive-PII fields

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-01 |
| **Deciders** | Engineering + Security owner (Astralabs) |
| **Refines** | ADR-0010 (OIDC/JWT + Zero Trust), ADR-0012 (external PCI payments) |
| **Scope** | Database implementation · **Security-Review-gated (R16)** |

## Context
The platform stores **sensitive-PII** (Domain Model §5.5, Manifest `dataSensitivityLevels`): Document Vault
contents, resume content, parsed-resume fields, form-fill data, category, and DOB. R15 requires field-level
encryption of the most sensitive attributes, no plaintext PII in logs, and access logging; R14 forbids
secrets (including encryption keys) in the database or git. We must decide *how* sensitive fields are
encrypted and how keys are managed.

## Decision
Encrypt sensitive-PII with **envelope encryption**: a per-record Data Encryption Key (DEK) encrypts the
value; a KMS-managed Key Encryption Key wraps the DEK. Keys never live in PostgreSQL. Document **bytes**
live in encrypted object storage; the DB holds only metadata, an integrity `checksum`, and an encrypted
locator. Sensitive scalar fields use the column triplet `<field>_ciphertext (bytea)`,
`<field>_dek_id (uuid)`, `<field>_enc_alg (text)` — with **no** plaintext `<field>` column.

## Consequences
### Positive
- Keys stay in the KMS/secrets manager, never in the database or backups (satisfies R14).
- Per-record DEKs limit blast radius and enable key rotation via `_enc_alg`/`_dek_id`.
- Plaintext sensitive values never touch columns, logs, or event payloads (R15, Domain Model §11.2).

### Trade-offs / negative
- Encrypted columns are **not queryable or indexable** — so sensitive fields can never be filter/sort keys;
  queryable derived signals (e.g. an eligibility verdict) must be computed and stored separately.
- Added complexity: a key registry, wrapping/unwrapping on the hot path, rotation tooling.
- Cross-field search/analytics on sensitive data requires deliberate, consented, minimized derivation.

## Alternatives considered
- **`pgcrypto` / column encryption in the DB** — rejected: puts key management near/in the database; weaker
  rotation and separation; still risks keys in DB config.
- **Transparent disk/tablespace encryption only** — rejected: protects at-rest media but not row-level
  access; does not satisfy field-level R15 for the crown-jewel data.
- **Application-wide single key** — rejected: no per-record isolation, painful rotation, large blast radius.

## Enforcement & compliance
Satisfies R15 and R16 (Vault/Resume Parser/Form Filling changes are Security-Review-gated). Pattern defined
in `docs/04_Database/01_SCHEMA_OVERVIEW.md §6`; applied in `06_DOCUMENTS_SCHEMA.md`, `05_CAREER_SCHEMA.md`
(DOB/category), `07_AI_SCHEMA.md` (parsed fields, assistant messages). Access logging paired via
`documents.vault_access_logs` (Domain Model §7.7).
