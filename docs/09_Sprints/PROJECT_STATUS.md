# CareerMitra — Project Status & 100-Sprint Tracker

> **The living status doc.** Concrete, PRD-aligned objectives for all 100 sprints, in serial
> (dependency) order, each marked DONE / IN-PROGRESS / NEXT / PENDING. This replaces the placeholder
> objectives in `README.md`. PRD refs point to sections of `docs/00_Project/prd/PRD.md`.
> Last updated: 2026-07-02.

## Legend
- ✅ **DONE** — built & verified
- 🔨 **IN-PROGRESS** — partially built
- 👉 **NEXT** — the immediate next sprint
- ⬜ **PENDING** — not started
- 📝 **DESIGN-DONE** — documented/designed, implementation pending

## Progress at a glance
| Measure | Status |
|---|---|
| Sprints complete (incl. docs/design) | **13 / 100 (~13%)** — S001–S009, S021–S024 |
| Current position | ✅ Data Engine complete **+ Part 2 web app live**: landing page, jobs list with **search + sector filters**, **job detail pages + SEO**, and a **profile/personalization** surface (cookie-based) — all reading verified jobs from Postgres, all tested. 👉 Next: real eligibility (needs rule extraction), Org/Exam profile pages (S038), auth (S012), formalize monorepo (S010) |
| **Data Engine (Part 1)** toward its MVP | **~40%** (S021–S024 of S021–S030 done) |
| **Platform (Part 2)** — user-facing product | **~0%** (no app/API/auth/search yet) |
| Actual user-facing product built | **~2–3%** |

> Reading: planning & the hard data-backend are well underway; the entire user-facing platform is not
> started. You are building data-first (correct per PRD strategy), but early.

---

## Phase 1 — Foundation (S001–S005) · ✅ COMPLETE
| # | Objective | PRD | Depends on | Status |
|---|---|---|---|---|
| S001 | Repo + folder structure + tooling/conventions | §44 | — | ✅ DONE |
| S002 | Master PRD v3.0 (single source of truth) | all | S001 | ✅ DONE |
| S003 | Domain model & canonical entities | §7 | S002 | ✅ DONE |
| S004 | Source Registry design + Data Engine PRD | §26 | S003 | ✅ DONE |
| S005 | Roadmap + 100-sprint plan | §39 | S004 | ✅ DONE |

## Phase 2 — Architecture (S006–S010)
| # | Objective | PRD | Depends on | Status |
|---|---|---|---|---|
| S006 | System & application architecture docs | §02 | S005 | ✅ DONE (design) |
| S007 | Database schema per bounded context | §04 | S006 | ✅ DONE (design) |
| S008 | API standards & contracts | §05 | S007 | ✅ DONE (design) |
| S009 | ADRs (schema-per-context, uuidv7, encryption, money) | §10 | S008 | ✅ DONE (design) |
| S010 | **Monorepo bootstrap**: scaffold apps/services/packages, CI, lint, env contract | §44 | S009 | ⬜ PENDING |

## Phase 3 — Core Platform (S011–S020) · ⬜ NOT STARTED
| # | Objective | PRD | Depends on | Status |
|---|---|---|---|---|
| S011 | Postgres + migration framework + base schema | §04 | S010 | ⬜ PENDING |
| S012 | Auth service (signup/login, sessions, OTP) | §33 | S011 | ⬜ PENDING |
| S013 | RBAC + roles (aspirant/reviewer/admin/support/T&S) | §33 | S012 | ⬜ PENDING |
| S014 | Aspirant Profile service (core fields, DOB→age, category) | §17 | S013 | ⬜ PENDING |
| S015 | Reference entities: Organizations, Departments + seed | §7 | S011 | ⬜ PENDING |
| S016 | Reference entities: Exams, Qualifications + seed | §7 | S015 | ⬜ PENDING |
| S017 | Skill taxonomy (managed, versioned) + cyber seed | §12.1 | S016 | ⬜ PENDING |
| S018 | Consent management + audit-log foundation | §34 | S013 | ⬜ PENDING |
| S019 | Document Vault foundation (encrypted store) | §20 | S018 | ⬜ PENDING |
| S020 | API gateway + shared packages (types, validation, errors) | §05 | S011 | ⬜ PENDING |

## Phase 4 — Crawler & Data / Data Engine (S021–S030) · 🔨 IN PROGRESS
| # | Objective | PRD | Depends on | Status |
|---|---|---|---|---|
| S021 | Resilient fetch (timeout, retry, broken-TLS handling) | §25 | — | ✅ DONE |
| S022 | Fix/verify source URLs (cyber sources recovered) | §26 | S021 | ✅ DONE |
| S023 | Relevance filter (recruitment-only; drop nav/product noise) | §25 | S022 | ✅ DONE |
| S024 | Opportunity-type classification (job/result/admit/answer/empanel) | §9 | S023 | ✅ DONE |
| S025 | JS-rendered sources — headless fetch (CERT-In, NIC, SSC) | §25 | S024 | ⏸ DEFERRED (needs headless; revisit at production) |
| S026 | Expand coverage: railway federation + more sources | §26 | S024 | ⬜ PENDING |
| S027 | Field extraction — vacancy count + confidence gate | §25 | S024 | ✅ DONE (vacancy + confidence + ⚠verify routing) |
| S027b | PDF text parsing (pdf-parse) + glyph-space handling | §25 | S027 | ✅ DONE (text PDFs read; vacancy from PDF bodies) |
| S027c | OCR for scanned PDFs + reliable close-date extraction | §25 | S027b | ⏸ FUTURE (needs Tesseract; dates human-verified until then) |
| S028 | Entity resolution (canonical org id) + semantic dedup (fuzzy + borderline→human) | §7 | S027 | ✅ DONE (Exam mapping deferred to S016) |
| S029 | Source health monitoring + run reports (`health` command: ok/empty/failed/never) | §26 | S027 | ✅ DONE |
| S030 | **Postgres store** (swap JSON, same interface) + schema + docker | §11 | S028 | ✅ DONE (verified end-to-end; history capture = future) |

## Phase 5 — Jobs & Search (S031–S040) · ⬜ NOT STARTED  ← *first user-visible output*
| # | Objective | PRD | Depends on | Status |
|---|---|---|---|---|
| S031 | Opportunity domain service + facet model on Postgres | §9 | S030 | ⬜ PENDING |
| S032 | Data-Engine→Platform publish seam (verified data → API) | §25 | S031 | ⬜ PENDING |
| S033 | Opportunity detail API + server-rendered page | §8 | S032 | ⬜ PENDING |
| S034 | Search index + 18 facets | §18.1 | S032 | ⬜ PENDING |
| S035 | Structured search API + filters UI | §18 | S034 | ⬜ PENDING |
| S036 | Ranking v1 (relevance, eligibility gate, freshness, deadline) | §18.2 | S035 | ⬜ PENDING |
| S037 | AI Smart Search (NL → facets) | §18.3 | S036, S044 | ⬜ PENDING |
| S038 | Entity/profile pages: Organization + Exam (SEO) | §8 | S033 | ⬜ PENDING |
| S039 | Entity/profile pages: Qualification + Skill | §8 | S038, S017 | ⬜ PENDING |
| S040 | SEO infra: SSR, structured data, sitemaps | §31 | S038 | ⬜ PENDING |

## Phase 6 — AI & Profile (S041–S050) · ⬜ NOT STARTED  ← *the differentiator*
| # | Objective | PRD | Depends on | Status |
|---|---|---|---|---|
| S041 | Intelligent Profile completion + derived signals | §17 | S014 | ⬜ PENDING |
| S042 | AI Eligibility Checker (deterministic rules) | §15 | S041, S016 | ⬜ PENDING |
| S043 | Skills Engine: Skill Match + Profile Match scoring | §12 | S017, S042 | ⬜ PENDING |
| S044 | AI governance foundation: model registry, prompt versioning, grounding gate | §16 | S020 | ⬜ PENDING |
| S045 | AI Resume Parser (+ sensitive-PII handling) | §15 | S044, S019 | ⬜ PENDING |
| S046 | **Career DNA Engine v1** (score, eligible-now, gaps) | §13 | S043, S045 | ⬜ PENDING |
| S047 | AI Personalized Recommendations (eligibility-gated) | §15 | S046 | ⬜ PENDING |
| S048 | AI Skill Gap + Certification recommendations | §12.4,§14 | S043 | ⬜ PENDING |
| S049 | Career Paths + Learning Roadmaps | §14 | S048 | ⬜ PENDING |
| S050 | AI eval harness + hallucination guardrails | §16 | S044 | ⬜ PENDING |

## Phase 7 — Applications (S051–S060) · ⬜ NOT STARTED
| # | Objective | PRD | Depends on | Status |
|---|---|---|---|---|
| S051 | Saved Jobs | §20 | S033 | ⬜ PENDING |
| S052 | Application Tracker + stages | §20 | S051 | ⬜ PENDING |
| S053 | Exam Calendar + personalization | §9.5 | S033 | ⬜ PENDING |
| S054 | Notifications infra (in-app, push, email) | §19 | S014 | ⬜ PENDING |
| S055 | Notification preferences + anti-fatigue + re-notify | §19 | S054 | ⬜ PENDING |
| S056 | SMS channel + result-day surge handling | §19 | S055 | ⬜ PENDING |
| S057 | Document Vault full (reuse, access log, retention) | §20 | S019 | ⬜ PENDING |
| S058 | AI Resume Builder | §15 | S045 | ⬜ PENDING |
| S059 | Form Filling Service — aspirant flow + lifecycle | §21 | S057 | ⬜ PENDING |
| S060 | Form Filling — executive tooling + fraud/refund/SLA | §21.3 | S059, S066 | ⬜ PENDING |

## Phase 8 — Admin & Ops (S061–S070) · ⬜ NOT STARTED
| # | Objective | PRD | Depends on | Status |
|---|---|---|---|---|
| S061 | Reviewer panel UI (verification gate at scale) | §27 | S030 | ⬜ PENDING |
| S062 | Admin panel (sources, entities, users, roles, flags) | §27 | S013 | ⬜ PENDING |
| S063 | Support workflow + ticketing | §27 | S062 | ⬜ PENDING |
| S064 | Escalation / Grievance workflow | §27,§34 | S063 | ⬜ PENDING |
| S065 | Content moderation, takedown + correction propagation | §27 | S061 | ⬜ PENDING |
| S066 | Fraud detection & Trust & Safety subsystem | §28 | S030 | ⬜ PENDING |
| S067 | Analytics event taxonomy + product analytics | §29 | S010 | ⬜ PENDING |
| S068 | A/B experimentation + metric governance | §29 | S067 | ⬜ PENDING |
| S069 | Feedback system + ratings | §29 | S067 | ⬜ PENDING |
| S070 | Incident/on-call + runbooks (`docs/11_Runbooks`) | §27,§36 | S062 | ⬜ PENDING |

## Phase 9 — Growth & Monetization (S071–S080) · ⬜ NOT STARTED
| # | Objective | PRD | Depends on | Status |
|---|---|---|---|---|
| S071 | Premium tier + subscription | §30 | S014 | ⬜ PENDING |
| S072 | Payments integration | §30 | S071 | ⬜ PENDING |
| S073 | Freemium gating (trust guardrails, no pay-to-rank) | §30.2 | S072 | ⬜ PENDING |
| S074 | Referral system + shareable Career DNA cards | §31.2 | S046 | ⬜ PENDING |
| S075 | Retention loops (streaks, roadmap progress, alerts) | §31.3 | S054 | ⬜ PENDING |
| S076 | Government Schemes module | §22 | S030 | ⬜ PENDING |
| S077 | Government Career News module | §23 | S030 | ⬜ PENDING |
| S078 | B2B / Institutional analytics (early) | §30 | S067 | ⬜ PENDING |
| S079 | Ecosystem referrals (certifications) | §30 | S048 | ⬜ PENDING |
| S080 | Ads (guardrailed, clearly labeled) | §30 | S073 | ⬜ PENDING |

## Phase 10 — Scale & Quality (S081–S090) · ⬜ NOT STARTED
| # | Objective | PRD | Depends on | Status |
|---|---|---|---|---|
| S081 | Performance: caching, p95 targets, CDN | §35 | S033 | ⬜ PENDING |
| S082 | Search scale + ranking quality loop | §18 | S036,S068 | ⬜ PENDING |
| S083 | Security hardening + pen test + Security Review gates | §33 | S012 | ⬜ PENDING |
| S084 | Privacy/DPDP: consent, data-rights, retention automation | §34 | S018 | ⬜ PENDING |
| S085 | Field-level encryption for sensitive PII | §33 | S019 | ⬜ PENDING |
| S086 | Observability: metrics, traces, logs, dashboards | §35 | S010 | ⬜ PENDING |
| S087 | Testing: unit/integration/e2e + golden datasets | §16 | S050 | ⬜ PENDING |
| S088 | Accessibility WCAG 2.1 AA audit | §38 | S035 | ⬜ PENDING |
| S089 | Internationalization: Hindi + regional | §37 | S033 | ⬜ PENDING |
| S090 | Cost controls: per-user cost tracking, AI/OCR/SMS budgets | §40 | S086 | ⬜ PENDING |

## Phase 11 — Launch & Future (S091–S100) · ⬜ NOT STARTED
| # | Objective | PRD | Depends on | Status |
|---|---|---|---|---|
| S091 | Production deployment + infra-as-code | §10 | S083 | ⬜ PENDING |
| S092 | Disaster recovery + backup + RTO/RPO + drills | §36 | S091 | ⬜ PENDING |
| S093 | Observability & alerting productionization | §35 | S086 | ⬜ PENDING |
| S094 | Cost optimization pass | §30.3 | S090 | ⬜ PENDING |
| S095 | Beta launch (limited cohort) | §39 | S092 | ⬜ PENDING |
| S096 | Bug bash + hardening | §39 | S095 | ⬜ PENDING |
| S097 | Public launch | §39 | S096 | ⬜ PENDING |
| S098 | Post-launch analytics + iteration | §40 | S097 | ⬜ PENDING |
| S099 | Roadmap v2 planning | §39 | S098 | ⬜ PENDING |
| S100 | Retrospective + v2 kickoff | §39 | S099 | ⬜ PENDING |

---

## The critical path to a first *visible* product
The shortest serial chain from today to "a real webpage showing verified cyber jobs":

**S025 → S026 → S027 → S028 → S030** (finish Data Engine)
**→ S010 → S011 → S020** (platform foundation: monorepo, Postgres, API)
**→ S031 → S032 → S033 → S035** (opportunity service → publish seam → detail page → search)
= **the first end-to-end slice a user can see.**

Then the differentiator: **S014 → S041 → S042 → S043 → S046** (profile → eligibility → skills → **Career DNA**).

## How to use this doc
1. Work strictly in serial order within your current phase; don't start a sprint until its "Depends on" are done (execution rule #4 in `README.md`).
2. When a sprint completes, change its status to ✅ and update "Progress at a glance".
3. Keep the PRD as the source of truth; if scope changes, update the PRD first, then this tracker.
