# CareerMitra — Growth, Content & Analytics API

| | |
|---|---|
| **Surface** | Referrals, affiliates, editorial content, analytics event ingestion |
| **Contexts** | Growth (15), Content (11), Analytics (14) · **Audience** | Mixed (aspirant / operator / client) |
| **Assumes** | `01_API_STANDARDS.md` |

> Trust-respecting growth (referrals, disclosed affiliates — **no pay-to-rank**), editorial content
> management, and the governed analytics event pipeline. Analytics events are **pseudonymous** and carry no
> plaintext PII.

## 1. Growth (aspirant)
| Method | Path | Auth / scope | Purpose | Maps to |
|---|---|---|---|---|
| `GET` | `/v1/me/referrals` | `growth.read` | My referrals + rewards | `growth.referrals` |
| `POST` | `/v1/me/referrals` | `growth.write` + consent + `Idempotency-Key` | Invite a peer | `growth.referrals` |
| `POST` | `/v1/referrals/{code}:accept` | bearer | Accept an invite on signup | `growth.referrals` |

## 2. Content
| Method | Path | Auth / scope | Purpose | Maps to |
|---|---|---|---|---|
| `GET` | `/v1/news` / `/{slug}` | public | (See Discovery) verified news | `content.career_news` |
| `GET` | `/v1/help/articles` / `/{slug}` | public | FAQ / KB self-service | `content.content_articles` |
| `GET`/`POST` | `/v1/ops/content[/{id}]` | `content.editor` | Author/review editorial content | `content.*` |
| `POST` | `/v1/ops/content/{id}:publish` | `content.approve` | Publish after review | `content.*` |

## 3. Analytics (client ingest + governance)
| Method | Path | Auth / scope | Purpose | Maps to |
|---|---|---|---|---|
| `POST` | `/v1/analytics/events` | bearer/anon + consent | Ingest governed product events (batch) | `analytics.analytics_events` |
| `GET` | `/v1/ops/experiments` / `/{id}` | `analytics.read` | Experiment status/decisions | `analytics.experiments` |
| `GET` | `/v1/ops/metrics` | `analytics.read` | Governed metric catalog | `analytics.metric_definitions` |

**Event ingest** — names must be in the governed taxonomy; payloads carry ids + minimized metadata:
```json
{ "events": [ { "event_name": "opportunity_saved", "at": "2026-07-01T10:00:00Z",
  "properties": { "opportunity_id": "opp_01H..." } } ] }
```
Unknown event name → `422 EVENT_NOT_IN_TAXONOMY`. Actor is pseudonymized server-side; consent respected.

## 4. Surface errors
| Code | Status | Meaning |
|---|---|---|
| `SELF_REFERRAL_BLOCKED` | 422 | Referrer = invitee |
| `AFFILIATE_DISCLOSURE_MISSING` | 422 | Affiliate link without disclosure |
| `EVENT_NOT_IN_TAXONOMY` | 422 | Event name not governed |
| `CONTENT_SOURCE_REQUIRED` | 422 | News item without a credible source |

## 5. Rules realized
| Rule | How |
|---|---|
| No pay-to-rank (§7.13) | affiliates disclosed, relevance-driven; never affect ranking |
| Anti-abuse referrals | `SELF_REFERRAL_BLOCKED`; incentives never grant data access |
| No rumor amplification (§23) | `CONTENT_SOURCE_REQUIRED`; review-before-publish |
| Privacy-safe analytics (§34) | pseudonymous events; governed taxonomy; no plaintext PII; consent |
| One definition per metric (§29) | metric catalog endpoint reads governed definitions |
