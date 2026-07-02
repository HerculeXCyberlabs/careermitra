# CareerMitra — Search API (public)

| | |
|---|---|
| **Surface** | Faceted search, AI Smart Search, suggestions · **Context** | Search & Discovery (7) |
| **Audience** | Public / Aspirant · **Assumes** | `01_API_STANDARDS.md` |

> Fast, faceted search over the OpenSearch read model (ADR-0004) plus natural-language **Smart Search**.
> Results are **verified-only** (the index is built from published events); ranking is governed, eligibility
> is a hard gate for signed-in users, and there is **no pay-to-rank**.

## 1. Endpoints
| Method | Path | Auth | Purpose | Maps to |
|---|---|---|---|---|
| `GET` | `/v1/search` | public/bearer | Faceted structured search | `search` read model |
| `POST` | `/v1/search/smart` | public/bearer | NL query → structured facets + results | `ai` (smart_search) + `search` |
| `GET` | `/v1/search/suggest` | public | Type-ahead suggestions (entities, facets) | `search.facets` + `reference` |
| `GET` | `/v1/search/facets` | public | Available facets & values for the UI | `search.facets` |

## 2. Behavior
- `GET /v1/search?q=cyber+security&filter[state]=DL&filter[opportunity_type]=job&sort=relevance&page_size=20`.
- **Personalization:** when a bearer token is present, results apply the aspirant's **Profile Match** and the
  **eligibility hard gate**; anonymous requests use the deterministic non-personalized fallback ranking.
- **Smart Search** (`POST /v1/search/smart`) maps NL intent to facets and returns the parsed interpretation
  so the UI can show/adjust it; falls back to verified structured results; never fabricates.
- **Zero-result recovery:** relaxes the least-important facet and returns `relaxed_facets` explaining what changed.

## 3. Key resource models
**Smart search request/response**
```json
// request
{ "q": "cyber security jobs in Delhi for B.Tech with no fee" }
// response
{ "interpreted": { "skill": "cyber-security", "location": "DL", "qualification": "b-tech", "fee": "none" },
  "data": [ { "opportunity_id": "opp_...", "title": "...", "match_score": 82 } ],
  "relaxed_facets": [], "page": { "has_more": true, "page_size": 20 },
  "ranking_version": "rank@2026.06.2" }
```
`match_score` (0–100) is explainable via the AI API (`/v1/matches/...`); ranking changes ship behind
experiments (`analytics.experiments`).

## 4. Surface errors
| Code | Status | Meaning |
|---|---|---|
| `INVALID_FILTER` / `INVALID_SORT` | 422 | Unknown facet/sort key |
| `QUERY_TOO_LONG` | 422 | NL query exceeds limit |
| `RATE_LIMITED` | 429 | Search/Smart-Search tiers (AI cost control) |

## 5. Rules realized
| Rule | How |
|---|---|
| R11 — verified-only | index built solely from published `recruitment` events |
| No pay-to-rank (§7.13) | ranking signals governed; no monetary signal; eligibility is a hard gate |
| Grounded Smart Search (R12) | returns `interpreted`; falls back to verified structured results |
| Fairness / fallback | deterministic non-personalized fallback for anonymous/degraded |
| Cost control (§16) | Smart Search on a tighter rate-limit tier |
