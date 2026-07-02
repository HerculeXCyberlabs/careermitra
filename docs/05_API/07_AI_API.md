# CareerMitra — AI API

| | |
|---|---|
| **Surface** | Eligibility, matching, recommendations, assistant, resume parse/build, doc analysis |
| **Context** | AI & Intelligence (6) · **Audience** | Aspirant · **Assumes** | `01_API_STANDARDS.md` |

> Every factual response is **grounded** (citations + `model_version`) and **never guarantees** outcomes
> (R12). Eligibility is **deterministic** (ADR-0016). Sensitive-PII inputs (resume) are consent-gated and
> never echoed. AI endpoints are on tighter rate-limit tiers (cost control, §16).

## 1. Endpoints
| Method | Path | Auth / scope | Purpose | Maps to |
|---|---|---|---|---|
| `POST` | `/v1/eligibility:check` | bearer `ai.eligibility` | Deterministic eligibility verdict | `ai.eligibility_evaluations` |
| `GET` | `/v1/opportunities/{id}/match` | bearer `ai.match` | Skill/Profile Match score (explained) | `ai` (match) |
| `GET` | `/v1/me/recommendations` | bearer `ai.recommend` | Ranked, eligibility-gated suggestions | `ai.recommendations` |
| `POST` | `/v1/assistant/sessions` | bearer `ai.assistant` | Start a grounded assistant session | `ai.assistant_sessions` |
| `POST` | `/v1/assistant/sessions/{id}/messages` | bearer `ai.assistant` | Send a message (grounded reply) | `ai.assistant_sessions` |
| `POST` | `/v1/me/resume:parse` | bearer + step-up + consent + `Idempotency-Key` | Parse an uploaded resume (proposed) | `ai.resume_parse_jobs` |
| `POST` | `/v1/me/resume:build` | bearer + consent | Generate a resume | `ai.resume_build_jobs` |
| `POST` | `/v1/me/documents/{id}:analyze` | bearer + step-up + consent | Check document completeness | `ai` (doc analysis) |

## 2. Behavior & models
- **Eligibility** — deterministic; response has `verdict` (`eligible`/`not_eligible`/`insufficient_data`),
  enumerated `reasons`, `relaxations_applied`, `unverified_inputs`, `citations`, `model_version`, and a
  non-guarantee `disclaimer`. See `Examples.md §5`.
- **Resume parse** — returns **proposed** structured fields for aspirant confirmation; nothing is applied to
  the profile until a confirm call. Extracted fields are sensitive-PII (encrypted; never logged).
- **Assistant** — every reply includes `citations` to verified data/official sources or degrades to "see
  official source"; untrusted content is treated as data (prompt-injection defense); PII minimized.

**Resume parse response**
```json
{ "job_id": "job_01H...", "status": "extracted", "confidence": 0.86,
  "proposed": { "skills": ["splunk","python"], "qualifications": ["b-tech"] },
  "requires_confirmation": true, "model_version": "resume-parse@2026.05.3" }
```

## 3. Surface errors
| Code | Status | Meaning |
|---|---|---|
| `ELIGIBILITY_INSUFFICIENT_DATA` | 200 (verdict) | Missing inputs — returned as a verdict, not an error |
| `GROUNDING_UNAVAILABLE` | 503 | Cannot ground → degrade to official source |
| `CONSENT_REQUIRED` / `STEP_UP_REQUIRED` | 403/401 | Sensitive AI actions |
| `RATE_LIMITED` | 429 | AI cost-control tier |

## 4. Rules realized
| Rule | How |
|---|---|
| R12 — grounded, non-guaranteeing | `citations` + `model_version` + `disclaimer`; degrade path |
| ADR-0016 — deterministic eligibility | rules engine, not LLM; enumerated reasons |
| R15 — sensitive PII | resume inputs encrypted, consent-gated, never echoed/logged |
| No pay-to-rank | recommendations eligibility-gated; factors disclosed |
| Cost control (§16) | tighter rate-limit tiers on AI endpoints |
