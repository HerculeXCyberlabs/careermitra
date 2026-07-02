# Examples — `docs/05_API`

Worked examples showing the expected shape of an API contract. Copy these patterns. Full conventions:
`01_API_STANDARDS.md`. **All values are synthetic** (R14).

## 1. Per-surface contract doc — required structure
Every `NN_<SURFACE>_API.md` contains:
1. Header table (surface, contexts, audience, "Assumes Standards").
2. **Endpoint table** — method, path, scope/auth, purpose, maps-to entity.
3. **Key resource models** — request/response field shapes for the important resources.
4. **Surface-specific errors** — codes beyond the core catalogue.
5. **Rules realized** — which `PROJECT_RULES.md` / Domain rules the contract enforces.

## 2. Endpoint table row
| Method | Path | Auth / scope | Purpose | Maps to |
|---|---|---|---|---|
| `GET` | `/v1/opportunities/{opportunityId}` | public | Verified opportunity detail | `recruitment.opportunities` |

## 3. A read response (verified-only, R11)
`GET /v1/opportunities/opp_01H8...`
```json
{
  "opportunity_id": "opp_01H8XZ...",
  "slug": "ssc-cgl-2026-assistant-section-officer",
  "title": "Assistant Section Officer",
  "opportunity_type": "job",
  "sector": "central",
  "status": "published",
  "organization": { "organization_id": "org_01H...", "short_name": "SSC", "slug": "ssc" },
  "key_dates": { "close_date": "2026-08-15", "exam_date": "2026-10-04" },
  "eligibility_summary": "Bachelor's degree; age 18–32 (relaxations apply).",
  "provenance": { "source_verified": true, "official_url": "https://ssc.gov.in/..." },
  "published_at": "2026-07-01T09:30:00Z"
}
```
> Only published, verified opportunities are returned. An unverified record yields `404 NOT_FOUND` — its
> existence is never leaked as content (R11).

## 4. A consent-gated, idempotent write (R13)
`POST /v1/service-requests`  · headers `Authorization`, `Idempotency-Key`, `X-Consent-Id`
```json
{ "opportunity_id": "opp_01H...", "form_id": "frm_01H...", "document_ids": ["doc_01H...","doc_01H..."] }
```
Missing consent →
```json
{ "type": ".../problems/consent-required", "title": "Consent required",
  "status": 403, "code": "CONSENT_REQUIRED",
  "detail": "Form filling requires an active consent for purpose 'form_filling'.",
  "request_id": "req_01H..." }
```

## 5. A grounded AI response (R12)
`POST /v1/eligibility:check`
```json
{
  "opportunity_id": "opp_01H...",
  "verdict": "eligible",
  "reasons": [
    { "rule": "age", "result": "pass", "detail": "27 within 18–32 (+3 OBC relaxation)" },
    { "rule": "qualification", "result": "pass", "detail": "B.Tech satisfies graduate requirement" }
  ],
  "unverified_inputs": ["category"],
  "citations": [ { "field": "age_limit", "source": "official_notification", "url": "https://..." } ],
  "model_version": "eligibility@2026.06.1",
  "disclaimer": "Guidance only — not a guarantee of selection or eligibility."
}
```
> Deterministic verdict, enumerated reasons, citations, model version, and an explicit non-guarantee (R12).

## 6. A paginated collection
`GET /v1/opportunities?filter[sector]=central&sort=-close_date&page_size=20`
```json
{
  "data": [ { "opportunity_id": "opp_...", "title": "..." } ],
  "page": { "cursor_next": "eyJvZmZzZXQi...", "has_more": true, "page_size": 20 },
  "meta": { "request_id": "req_01H..." }
}
```

## 7. Anti-examples (rejected in review)
| ✗ Don't | ✓ Do |
|---|---|
| `GET /v1/getJob?id=..` | `GET /v1/opportunities/{opportunityId}` |
| `"price": 499.0` | `"fee": { "amount_minor": 49900, "currency": "INR" }` |
| Return unverified opportunity with a `verified:false` flag | `404 NOT_FOUND` (R11) |
| Auto-submit an official form on `POST` | require `X-Consent-Id`; never auto-submit (R13) |
| Ad-hoc `{ "error": "bad" }` | RFC 7807 problem+json with stable `code` |
| Echo document bytes / Aadhaar in a response | minimal fields; bytes via short-lived signed URL only (R15) |
| Breaking change inside `/v1` | add `/v2` with deprecation window (R8) |
