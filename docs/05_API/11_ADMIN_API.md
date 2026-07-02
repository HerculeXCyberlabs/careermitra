# CareerMitra — Admin & Operations API (operator)

| | |
|---|---|
| **Surface** | Verification/review, publishing, moderation, feature flags, Source Registry ops |
| **Contexts** | Administration (12), Crawler & Ingestion (10) · **Audience** | Operator (reviewer/admin) |
| **Assumes** | `01_API_STANDARDS.md` · operator scopes + ABAC · **ingestion changes Security-Review-gated (R16)** |

> The operator surface behind the **verification gate**. Every action is audited (`admin.audit_log`);
> reviewer ≠ record author (SoD). Publishing is the only path that makes recruitment data user-visible.

## 1. Review & publishing
| Method | Path | Auth / scope | Purpose | Maps to |
|---|---|---|---|---|
| `GET` | `/v1/admin/review-tasks` | `review.read` | Prioritized review queue (by confidence) | `admin.review_tasks` |
| `POST` | `/v1/admin/review-tasks/{id}:assign` | `review.write` | Claim/assign | `admin.review_tasks` |
| `POST` | `/v1/admin/review-tasks/{id}:approve` | `review.approve` | Approve → triggers publishing | `admin.publishing_workflows` |
| `POST` | `/v1/admin/review-tasks/{id}:reject` | `review.approve` | Reject with reason | `admin.review_tasks` |
| `POST` | `/v1/admin/review-tasks/{id}:escalate` | `review.write` | Escalate | `admin.review_tasks` |
| `POST` | `/v1/admin/moderation-actions` | `moderation.write` | Correct/withdraw/dedupe published data | `admin.moderation_actions` |
| `GET` | `/v1/admin/audit-log` | `audit.read` | Query the immutable audit log | `admin.audit_log` |
| `GET`/`POST` | `/v1/admin/feature-flags[/{key}]` | `admin.flags` | Manage flags/rollouts | `admin.feature_flags` |
| `POST` | `/v1/admin/refunds/{id}:approve` | `finance.approve` | Approve a refund (SoD vs requester) | `payments.refunds` |

## 2. Source Registry & health (ingestion ops)
| Method | Path | Auth / scope | Purpose | Maps to |
|---|---|---|---|---|
| `GET`/`POST` | `/v1/admin/sources[/{id}]` | `sources.write` | Register/manage sources (legal status) | `crawler.sources` |
| `GET` | `/v1/admin/sources/{id}/health` | `sources.read` | Freshness/success/drift | `crawler.source_health` |
| `GET` | `/v1/admin/crawler-runs` | `sources.read` | Run history & failures | `crawler.crawler_runs` |
| `POST` | `/v1/admin/crawler-jobs/{id}:pause` | `sources.write` | Pause/resume within legal limits | `crawler.crawler_jobs` |

## 3. Behavior
- **Approve** requires the reviewer to differ from the record's author (SoD, checked server-side) →
  `409 SEPARATION_OF_DUTIES` otherwise. Approval emits publishing which indexes, captures history, notifies.
- **Moderation** on a material field re-notifies tracked aspirants; withdrawal transitions the opportunity
  to `withdrawn`.
- All endpoints write `admin.audit_log`; the audit-log endpoint is read-only (append-only store).

## 4. Surface errors
| Code | Status | Meaning |
|---|---|---|
| `SEPARATION_OF_DUTIES` | 409 | Reviewer/approver = author, or approver = refund requester |
| `NOT_APPROVED` | 409 | Publish attempted without an approved task |
| `SOURCE_LEGAL_STATUS_MISSING` | 422 | Activating a source before legal status recorded |

## 5. Rules realized
| Rule | How |
|---|---|
| R11 — verification gate | publish only via `:approve`; `NOT_APPROVED` guard |
| R17 — SoD / least privilege | reviewer≠author, approver≠requester; operator scopes + ABAC |
| Auditability (§7.7) | every action → `admin.audit_log`; read-only exposure |
| Material-change re-notification (§7.12) | moderation emits events to Notifications |
| Ingestion legal governance | source legal status enforced; Security-Review-gated |
