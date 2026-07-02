# CareerMitra — Auth & Consent API

| | |
|---|---|
| **Surface** | Authentication, session, and consent · **Context** | Identity & Access (Domain Model §5.1) |
| **Audience** | Aspirant (and operator login) · **Assumes** | `01_API_STANDARDS.md` · **Security-Review-gated (R16)** |

> Login/session and the **consent** grants every sensitive-PII action across the platform checks. Auth
> follows OIDC + short-lived JWT (ADR-0010); secrets are never returned. Consent is purpose-specific,
> revocable, and audited.

## 1. Endpoints
| Method | Path | Auth | Purpose | Maps to |
|---|---|---|---|---|
| `POST` | `/v1/auth/register` | public | Start registration (contact verification) | `identity.users` |
| `POST` | `/v1/auth/verify-contact` | public | Confirm email/phone OTP | `identity.auth_credentials` |
| `POST` | `/v1/auth/login` | public | OIDC/password login → tokens | `identity.sessions` |
| `POST` | `/v1/auth/token/refresh` | refresh token | Rotate access token | `identity.sessions` |
| `POST` | `/v1/auth/step-up` | bearer | Strong-auth assertion for sensitive actions | `identity.auth_credentials` |
| `POST` | `/v1/auth/logout` | bearer | Revoke session (clears local sensitive data) | `identity.sessions` |
| `GET` | `/v1/me` | bearer | Current user summary | `identity.users` |
| `GET` | `/v1/me/sessions` | bearer | List active sessions | `identity.sessions` |
| `DELETE` | `/v1/me/sessions/{sessionId}` | bearer | Revoke a session | `identity.sessions` |
| `GET` | `/v1/me/consents` | bearer | List consent grants | `identity.consent_records` |
| `POST` | `/v1/me/consents` | bearer + `Idempotency-Key` | Grant a purpose-specific consent | `identity.consent_records` |
| `DELETE` | `/v1/me/consents/{consentId}` | bearer | Revoke a consent (honored promptly) | `identity.consent_records` |
| `POST` | `/v1/me/data-requests` | bearer + step-up | File access/deletion/portability request (DPDP) | `support.grievances` |

## 2. Key resource models
**Login response**
```json
{ "access_token": "<jwt>", "token_type": "Bearer", "expires_in": 900,
  "refresh_token": "<opaque>", "user": { "user_id": "usr_01H...", "locale": "hi-IN", "account_type": "aspirant" } }
```
**Consent grant request**
```json
{ "purpose_code": "form_filling", "scope": "opportunity:opp_01H...", "terms_version": "2026-05" }
```
Response includes `consent_id` to pass as `X-Consent-Id` on the gated action. Minors: `guardian_consent`
is required and enforced server-side.

## 3. Surface errors (beyond core)
| Code | Status | Meaning |
|---|---|---|
| `CONTACT_NOT_VERIFIED` | 403 | Sensitive action before contact verification |
| `OTP_INVALID` / `OTP_EXPIRED` | 422 | Verification failed |
| `CONSENT_PURPOSE_UNKNOWN` | 422 | Purpose not in the governed catalog |
| `STEP_UP_REQUIRED` | 401 | Data request / sensitive action needs step-up |

## 4. Rules realized
| Rule | How |
|---|---|
| R14 — no secrets returned | tokens only; never password/secret material |
| R13 — consent-gated | consents issued/revoked here; `consent_id` gates actions elsewhere |
| R15 / §34 — data rights | `/me/data-requests` triggers access/erasure workflow with SLA |
| Minors (§17.4) | guardian-aware consent enforced |
| Shared-device safety | logout clears local sensitive data; session revoke |
