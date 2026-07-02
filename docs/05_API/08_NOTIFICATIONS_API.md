# CareerMitra — Notifications API

| | |
|---|---|
| **Surface** | Alerts inbox, preferences, subscriptions · **Context** | Notifications & Engagement (16) |
| **Audience** | Aspirant · **Assumes** | `01_API_STANDARDS.md` |

> Manages outbound **Alerts** (not official `Notification`s — Ubiquitous Language) and the aspirant's
> preferences and subscriptions. Opting into a channel is consent-aware; delivery is idempotent and
> anti-fatigue capped server-side.

## 1. Endpoints
| Method | Path | Auth / scope | Purpose | Maps to |
|---|---|---|---|---|
| `GET` | `/v1/me/alerts` | `alerts.read` | Alert inbox (paginated) | `notifications.alerts` |
| `POST` | `/v1/me/alerts/{id}:read` | `alerts.write` | Mark read | `notifications.alerts` |
| `GET` | `/v1/me/alert-preferences` | `alerts.read` | Per-type/channel prefs + quiet hours | `notifications.alert_preferences` |
| `PUT` | `/v1/me/alert-preferences` | `alerts.write` + consent | Update prefs (opt-in/out) | `notifications.alert_preferences` |
| `GET` | `/v1/me/alert-subscriptions` | `alerts.read` | List subscriptions | `notifications.alert_subscriptions` |
| `POST` | `/v1/me/alert-subscriptions` | `alerts.write` + `Idempotency-Key` | Subscribe (saved-search/exam/skill/opportunity) | `notifications.alert_subscriptions` |
| `DELETE` | `/v1/me/alert-subscriptions/{id}` | `alerts.write` | Unsubscribe | `notifications.alert_subscriptions` |

## 2. Key resource models
**Alert (read)** — references only, no PII payload:
```json
{ "alert_id": "alt_01H...", "alert_type": "deadline", "channel": "in_app", "status": "delivered",
  "subject_ref": { "opportunity_id": "opp_01H..." }, "created_at": "2026-07-01T06:00:00Z" }
```
**Preferences (PUT)**
```json
{ "channel_by_type": { "deadline": ["in_app","push"], "result_out": ["in_app","email"] },
  "quiet_hours": { "start": "22:00", "end": "07:00", "tz": "Asia/Kolkata" }, "digest_enabled": true }
```
> SMS is available only for high-value, time-critical types (cost control, §19). Opt-out is honored on every
> send; anti-fatigue caps and quiet hours are enforced server-side.

## 3. Surface errors
| Code | Status | Meaning |
|---|---|---|
| `CHANNEL_NOT_ALLOWED_FOR_TYPE` | 422 | e.g. SMS requested for a low-value type |
| `SUBSCRIPTION_TARGET_INVALID` | 422 | Target not a valid saved-search/exam/skill/opportunity |
| `CONSENT_REQUIRED` | 403 | Enabling an outbound channel needs consent |

## 4. Rules realized
| Rule | How |
|---|---|
| Alert ≠ Notification (ADR-0014) | resource is `alerts`; official announcements live in Discovery |
| R13 — consent | outbound channel opt-in is consent-aware; opt-out honored |
| Idempotent delivery (§7.14) | subscriptions/opt-ins take `Idempotency-Key`; no duplicate sends |
| Anti-fatigue / cost (§19) | quiet hours, caps, SMS restricted — enforced server-side |
| No PII in payloads | alerts carry references, not sensitive content |
