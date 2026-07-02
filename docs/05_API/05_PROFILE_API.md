# CareerMitra — Profile & Journey API

| | |
|---|---|
| **Surface** | Profile, skills/qualifications, saved items, applications, Career DNA, roadmaps |
| **Context** | Career & Journey (4) · **Audience** | Aspirant · **Assumes** | `01_API_STANDARDS.md` |

> The aspirant's career workspace. Sensitive demographics (DOB, category) are write-only-ish: accepted for
> eligibility accuracy, stored encrypted, never echoed in full. Derived signals (Profile Completion, Career
> DNA) are read-only outputs computed by the AI context.

## 1. Endpoints
| Method | Path | Auth / scope | Purpose | Maps to |
|---|---|---|---|---|
| `GET` | `/v1/me/profile` | `profile.read` | Profile + derived signals | `career.profiles` |
| `PATCH` | `/v1/me/profile` | `profile.write` (`If-Match`) | Update profile fields | `career.profiles` |
| `GET`/`POST`/`DELETE` | `/v1/me/profile/skills[/{id}]` | `profile.write` | Manage held skills | `career.profile_skills` |
| `GET`/`POST`/`DELETE` | `/v1/me/profile/qualifications[/{id}]` | `profile.write` | Manage qualifications | `career.profile_qualifications` |
| `GET`/`POST`/`DELETE` | `/v1/me/profile/experiences[/{id}]` | `profile.write` | Manage experience | `career.experiences` |
| `GET` | `/v1/me/career-dna` | `profile.read` | Career DNA card (cached) | `career.career_dna` |
| `POST` | `/v1/me/career-dna:recompute` | `profile.write` + `Idempotency-Key` | Trigger recompute | `ai` (dna) |
| `GET` | `/v1/me/roadmaps` | `profile.read` | Learning roadmaps | `career.career_roadmaps` |
| `GET`/`POST`/`DELETE` | `/v1/me/saved-jobs[/{id}]` | `profile.write` | Shortlist opportunities | `career.saved_jobs` |
| `GET`/`POST`/`DELETE` | `/v1/me/saved-searches[/{id}]` | `profile.write` | Stored searches (alertable) | `career.saved_searches` |
| `GET`/`POST` | `/v1/me/applications` | `profile.write` | Track applications | `career.applications` |
| `PATCH` | `/v1/me/applications/{id}` | `profile.write` (`If-Match`) | Advance stage | `career.applications` |
| `GET` | `/v1/me/applications/{id}/stages` | `profile.read` | Immutable stage history | `career.application_stage_history` |

## 2. Key resource models
**Profile (read)** — returns derived signals and **masked** sensitive fields:
```json
{ "profile_id": "prf_01H...", "profile_completion_pct": 72.5, "eligibility_score": 61.0,
  "category_masked": "OBC", "dob_year": 1999, "languages": ["hi","en"],
  "preferences": { "states": ["DL","UP"], "job_types": ["permanent"] }, "version": 8 }
```
> Full DOB/category are never returned — only coarse/masked forms for display; the encrypted values are
> server-side only (ADR-0020). Updates send the raw value once over TLS; it is encrypted at rest.

**Application stage transition** — `PATCH` with `{ "to_stage": "applied" }` appends to the immutable history.

## 3. Surface errors
| Code | Status | Meaning |
|---|---|---|
| `INVALID_STAGE_TRANSITION` | 422 | Stage order violated |
| `VERSION_CONFLICT` | 409 | Stale `If-Match` on profile/application |
| `OPPORTUNITY_NOT_VISIBLE` | 404 | Saved/applied target not a verified opportunity |

## 4. Rules realized
| Rule | How |
|---|---|
| R15 — sensitive PII | DOB/category encrypted, masked in responses, never fully echoed |
| Grounded DNA (R12) | Career DNA read-only; explanations + `model_version` included |
| Journey audit trail | stage history is append-only, read-only |
| Canonical refs | skills/qualifications/opportunities by id |
