# CareerMitra — Support & Trust API

| | |
|---|---|
| **Surface** | Tickets, grievances, feedback, abuse reports, fraud cases · **Context** | Support & Trust (13) |
| **Audience** | Aspirant (report/ticket) + Operator (triage/fraud) · **Assumes** | `01_API_STANDARDS.md` |

> Support, formal grievance redressal (DPDP-aligned), and first-class **Trust & Safety**. Every user-facing
> surface links to an abuse-report path feeding this context with SLAs. Fraud actions can withhold/withdraw
> listings via Admin moderation.

## 1. Aspirant endpoints
| Method | Path | Auth / scope | Purpose | Maps to |
|---|---|---|---|---|
| `GET`/`POST` | `/v1/me/support-tickets[/{id}]` | `support.write` | Raise/track tickets | `support.support_tickets` |
| `POST` | `/v1/me/support-tickets/{id}/messages` | `support.write` | Add a message | `support.ticket_messages` |
| `POST` | `/v1/me/grievances` | `support.write` | File a formal grievance | `support.grievances` |
| `POST` | `/v1/feedback` | bearer | Submit product feedback/rating | `support.feedback` |
| `POST` | `/v1/abuse-reports` | public/bearer + `Idempotency-Key` | Report fake listing/scam/impersonation | `support.abuse_reports` |

## 2. Operator endpoints (Trust & Safety)
| Method | Path | Auth / scope | Purpose | Maps to |
|---|---|---|---|---|
| `GET` | `/v1/ops/support-tickets` | `support.agent` | Queue with SLA | `support.support_tickets` |
| `GET`/`POST` | `/v1/ops/grievances[/{id}]` | `grievance.officer` | Redressal with SLA | `support.grievances` |
| `GET` | `/v1/ops/abuse-reports` | `trust.read` | Triage reports | `support.abuse_reports` |
| `GET`/`POST` | `/v1/ops/fraud-cases[/{id}]` | `trust.write` | Manage fraud cases/signals | `support.fraud_cases` |
| `POST` | `/v1/ops/fraud-cases/{id}:action` | `trust.write` | Withhold/withdraw/suspend (→ moderation) | `support.fraud_cases` |

## 3. Key resource model
**Abuse report**
```json
{ "target_type": "opportunity", "target_id": "opp_01H...", "reason": "suspected_fake",
  "evidence": { "note": "fee to a personal UPI id" } }
```
Feeds Trust & Safety with an SLA; may create a `fraud_case`. Confirmed fraud → `admin.moderation_actions`
withholds/withdraws the listing and re-notifies affected aspirants.

## 4. Surface errors
| Code | Status | Meaning |
|---|---|---|
| `TICKET_CATEGORY_INVALID` | 422 | Category not in catalog |
| `GRIEVANCE_SLA_BREACH` | 200 (flag) | Surfaced in operator views, not an error |
| `REPORT_TARGET_INVALID` | 422 | Unknown target |

## 5. Rules realized
| Rule | How |
|---|---|
| Trust & Safety first-class (§28) | fraud cases/signals; report path on every surface |
| Grievance redressal (§34) | officer-owned, SLA-tracked, auditable |
| Fake-listing suppression (R11 trust) | `:action` → moderation withhold/withdraw + re-notify |
| Executive-abuse control (R17) | fraud type `executive_abuse`; anomaly signals; audited |
