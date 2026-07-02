# CareerMitra — Professional Services API (Form Filling)

| | |
|---|---|
| **Surface** | Assisted Form Filling requests, review, submission, proof · **Context** | Professional Services (9) |
| **Audience** | Aspirant + Executive · **Assumes** | `01_API_STANDARDS.md` · **consent-gated · Security-Review-gated (R16)** |

> Assisted form completion. **Never auto-submits**: submission requires an explicit `X-Consent-Id` and an
> aspirant review step. Executives access a request only via a **scoped, time-boxed** assignment (ABAC).
> Starts only after the order is paid. External portal credentials are **never** accepted or stored.

## 1. Aspirant endpoints
| Method | Path | Auth / scope | Purpose | Maps to |
|---|---|---|---|---|
| `POST` | `/v1/service-requests` | `service.write` + consent + `Idempotency-Key` | Request form filling (after paid order) | `services.service_requests` |
| `GET` | `/v1/me/service-requests` / `/{id}` | `service.read` | Track progress + assigned executive | `services.service_requests` |
| `POST` | `/v1/service-requests/{id}:review` | `service.write` | Approve/request changes on prepared form | `services.service_requests` |
| `POST` | `/v1/service-requests/{id}:submit` | `service.write` + step-up + consent | **Explicit** submit consent | `services.service_requests` |
| `GET` | `/v1/service-requests/{id}/proof` | `service.read` | Download submission proof | `services.service_proofs` |
| `POST` | `/v1/service-requests/{id}/rating` | `service.write` | Rate the service | `services.service_reviews` |

## 2. Executive endpoints (scoped by assignment — ABAC)
| Method | Path | Auth / scope | Purpose | Maps to |
|---|---|---|---|---|
| `GET` | `/v1/executive/assignments` | `executive` | My active assignments only | `services.service_assignments` |
| `GET` | `/v1/executive/service-requests/{id}` | `executive` (assigned) | Scoped request view (consented docs) | `services.service_requests` |
| `POST` | `/v1/executive/service-requests/{id}:prepare` | `executive` (assigned) | Mark prepared/ready for review | `services.service_requests` |

> An Executive token grants access **only** to requests assigned to them, within the assignment's time box
> (ABAC, ADR-0010). All executive actions are audited. No broad Vault access.

## 3. Key resource model
**Submit** — requires consent; returns proof reference:
```json
// POST :submit  (headers: X-Consent-Id, step-up)
{ "confirmed": true }
// 200
{ "status": "submitted", "proof_id": "prf_01H...", "submitted_at": "2026-07-01T10:22:00Z" }
```
Missing consent → `403 CONSENT_REQUIRED`. Service failure path → refund eligibility (`payments.refunds`).

## 4. Surface errors
| Code | Status | Meaning |
|---|---|---|
| `ORDER_NOT_PAID` | 409 | Request created before payment |
| `CONSENT_REQUIRED` | 403 | Submit without explicit consent |
| `ASSIGNMENT_EXPIRED` | 403 | Executive access outside the time box |
| `EXTERNAL_CREDENTIAL_REJECTED` | 422 | Portal credentials are never accepted |

## 5. Rules realized
| Rule | How |
|---|---|
| R13 — never auto-submit | `:submit` requires explicit consent + step-up |
| R16 — no stored portal credentials | credentials rejected by contract; Security-Review-gated |
| R17 — least privilege / SoD | executive ABAC scope + time box; actions audited |
| Refund on failure (§21) | failure → `payments.refunds` |
