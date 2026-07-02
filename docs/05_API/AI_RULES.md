# AI_RULES — `docs/05_API`

Rules for any AI tool writing or changing API contracts. Inherits `AI_INSTRUCTIONS.md`, `PROJECT_RULES.md`;
those win on conflict.

## Before you write
1. Read `01_API_STANDARDS.md` — do not re-define versioning/auth/errors/pagination per file; link to it.
2. Read the resource's Domain Model entity (§5) and its `docs/04_Database` schema. **Every resource maps to
   a documented entity/table.** Do not invent fields; expose a resource model, never the raw table.
3. Use glossary terms in paths and fields (`opportunities`, not `jobs`).

## Hard rules (never violate)
- **Verified-only reads (R11).** No public/aspirant endpoint may return opportunity/record/cutoff/scheme
  data that is not published + verified. A contract that can leak unverified data is a severity-1 defect.
- **Consent-gated writes (R13).** Any action taken on the aspirant's behalf (Form Filling submit, outbound
  alerts opt-in, sharing) requires an explicit consent reference (`X-Consent-Id`) and returns
  `CONSENT_REQUIRED` if absent. Never design an auto-submit endpoint.
- **Sensitive-PII endpoints (R15).** Vault/resume/form-data endpoints require step-up auth + consent, return
  minimal fields, and never echo document bytes or secrets. Their access is logged server-side.
- **Grounded AI (R12).** Every AI endpoint returning a factual claim includes grounding — `citations` /
  `sources` and `model_version` fields — and can degrade to "see official source". No guaranteed-outcome
  language in any response.
- **No secrets/PII in examples (R14).** Use synthetic, obviously-fake values. No real Aadhaar, names,
  emails, tokens — ever, including error examples.
- **No breaking changes without a version (R8).** Additive changes only within `/v1`; breaking → `/v2` with
  a deprecation window. Never repurpose or remove a field silently.

## Discipline
- One RFC 7807 problem shape and the shared error-code catalogue for every failure — no ad-hoc error bodies.
- Every unsafe write (`POST`/`PATCH`/`DELETE` that isn't naturally idempotent) documents `Idempotency-Key`.
- Money is always `{ amount_minor, currency }`; timestamps are RFC 3339 UTC `_at` fields.
- State the auth (scopes, step-up, consent) and the applicable rate-limit tier on every endpoint.
- Changes to auth, Vault, Resume Parser, Form Filling, or the ingestion boundary are Security-Review-gated
  (R16) — say so in the contract.
- No placeholders/TODO in merged contracts (R9); leave a surface out of the catalogue as "Planned" instead.
