# CareerMitra — Documents & Vault API (sensitive-PII)

| | |
|---|---|
| **Surface** | Document Vault: upload, list, retrieve, delete · **Context** | Documents & Vault (5) |
| **Audience** | Aspirant · **Assumes** | `01_API_STANDARDS.md` · **Step-up + consent required · Security-Review-gated (R16)** |

> The crown-jewel surface. Every endpoint requires **step-up auth** and a valid **`X-Consent-Id`**; every
> access is **logged server-side** (`documents.vault_access_log`). Document **bytes are never in JSON** —
> upload/download use short-lived signed URLs to encrypted object storage. Responses return metadata only.

## 1. Endpoints
| Method | Path | Auth | Purpose | Maps to |
|---|---|---|---|---|
| `GET` | `/v1/me/vault` | `vault.read` + step-up + consent | Vault summary | `documents.document_vaults` |
| `GET` | `/v1/me/vault/documents` | `vault.read` + step-up + consent | List document metadata | `documents.documents` |
| `POST` | `/v1/me/vault/documents:init-upload` | `vault.write` + step-up + consent + `Idempotency-Key` | Get a signed upload URL | `documents.documents` |
| `POST` | `/v1/me/vault/documents/{id}:complete-upload` | `vault.write` + step-up | Finalize after object PUT | `documents.documents` |
| `GET` | `/v1/me/vault/documents/{id}` | `vault.read` + step-up + consent | Metadata + short-lived download URL | `documents.documents` |
| `DELETE` | `/v1/me/vault/documents/{id}` | `vault.write` + step-up | Aspirant-controlled deletion | `documents.documents` |
| `GET` | `/v1/me/vault/access-log` | `vault.read` + step-up | The aspirant's own access history | `documents.vault_access_log` |

## 2. Flow (upload)
1. `:init-upload` returns `{ document_id, upload_url, expires_in }` (signed, single-use).
2. Client PUTs bytes directly to `upload_url` (object storage) — **bytes never transit this API**.
3. `:complete-upload` records `checksum`, triggers virus/integrity scan and optional AI Document Analyzer.

## 3. Key resource models
**Document metadata (read)** — no content, ever:
```json
{ "document_id": "doc_01H...", "document_type": "marksheet", "status": "verified",
  "issuer": "CBSE", "valid_until": null, "checksum": "sha256:...", "created_at": "2026-06-20T..." }
```
**Download** returns `{ "download_url": "https://obj...&sig=...", "expires_in": 120 }` — short-lived, logged.

## 4. Surface errors
| Code | Status | Meaning |
|---|---|---|
| `STEP_UP_REQUIRED` | 401 | Missing recent strong auth |
| `CONSENT_REQUIRED` | 403 | Missing/invalid `X-Consent-Id` for the purpose |
| `DOCUMENT_TYPE_NOT_ALLOWED` | 422 | Disallowed type/format |
| `UPLOAD_INTEGRITY_FAILED` | 422 | Checksum/scan failure |

## 5. Rules realized
| Rule | How |
|---|---|
| R15 — encrypt, minimize, access-log | bytes in object storage; metadata-only responses; every access logged |
| R16 — Security Review gate | stated; all changes gated |
| R13 — consent | `X-Consent-Id` required with matching purpose |
| Shared-device safety | step-up per session; short-lived URLs |
| Aspirant control | delete + own access-log endpoints |
