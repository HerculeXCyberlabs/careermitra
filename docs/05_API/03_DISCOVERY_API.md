# CareerMitra — Discovery API (public)

| | |
|---|---|
| **Surface** | Opportunities, official records, exam calendar, schemes, entity profiles |
| **Contexts** | Recruitment (3), Reference (2), Content (11) · **Audience** | Public / Aspirant |
| **Assumes** | `01_API_STANDARDS.md` — **verified-only (R11)** is absolute on this surface |

> The public, SEO-critical read surface. **Every endpoint returns only published, verified data**; unverified
> records are `404` (never leaked as content). Entity profiles are addressed by `slug` for SEO. All endpoints
> are cacheable/CDN-frontable and localized (`Accept-Language`).

## 1. Endpoints
| Method | Path | Auth | Purpose | Maps to |
|---|---|---|---|---|
| `GET` | `/v1/opportunities` | public | List/filter verified opportunities | `recruitment.opportunities` |
| `GET` | `/v1/opportunities/{opportunityId}` | public | Opportunity detail (provenance) | `recruitment.opportunities` |
| `GET` | `/v1/opportunities/{id}/posts` | public | Posts & eligibility for an opportunity | `recruitment.posts` |
| `GET` | `/v1/opportunities/{id}/vacancies` | public | Vacancy breakdown | `recruitment.vacancies` |
| `GET` | `/v1/results` | public | Verified results (filter by exam/org) | `recruitment.results` |
| `GET` | `/v1/admit-cards` | public | Admit-card availability | `recruitment.admit_cards` |
| `GET` | `/v1/answer-keys` | public | Provisional/final answer keys | `recruitment.answer_keys` |
| `GET` | `/v1/exam-calendar` | public/bearer | Calendar events (personalized if bearer) | `recruitment.calendar_events` |
| `GET` | `/v1/schemes` / `/v1/schemes/{slug}` | public | Government schemes | `recruitment.government_schemes` |
| `GET` | `/v1/organizations/{slug}` | public | Organization profile | `reference.organizations` |
| `GET` | `/v1/departments/{slug}` | public | Department profile | `reference.departments` |
| `GET` | `/v1/exams/{slug}` | public | Exam profile (pattern, history) | `reference.exams` |
| `GET` | `/v1/exams/{slug}/cutoffs` | public | Cutoff history (trends) | `recruitment.cutoff_history` |
| `GET` | `/v1/qualifications/{slug}` | public | Qualification profile | `reference.qualifications` |
| `GET` | `/v1/skills/{slug}` | public | Skill profile | `reference.skills` |
| `GET` | `/v1/news` / `/v1/news/{slug}` | public | Verified career news | `content.career_news` |

## 2. Filtering (opportunities)
`filter[sector]`, `filter[opportunity_type]`, `filter[state]`, `filter[department]`, `filter[qualification]`,
`filter[skill]`, `filter[organization]`, `filter[deadline_before]`, `filter[level]` — all from controlled
vocabularies. `sort=-close_date|-published_at|title`. Cursor pagination (Standards §6).

## 3. Key resource models
Opportunity detail — see `Examples.md §3`. Every record carries a `provenance` block
(`source_verified`, `official_url`) and published dates. Trend widgets (`/exams/{slug}/cutoffs`) return
category-wise marks across years from the append-only history (never reconstructed).

## 4. Surface errors
| Code | Status | Meaning |
|---|---|---|
| `NOT_FOUND` | 404 | Not published/verified (existence never confirmed) |
| `INVALID_FILTER` | 422 | Unknown facet/value |

## 5. Rules realized
| Rule | How |
|---|---|
| R11 — verified-only | filter enforces `verified_at` + published `status`; unverified → 404 |
| Provenance | every item returns `provenance`/`official_url` |
| SEO (§31) | entity profiles by `slug`; server-renderable; localized; cacheable |
| History from day one (§11) | cutoff/trend endpoints read append-only snapshots |
| Official links only | `application_url`/`official_url` from verified org domains |
