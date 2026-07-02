# CareerMitra PRD — Investment-Grade Design Review

| | |
|---|---|
| **Reviewed document** | PRD v2.0 (Master) |
| **Review type** | Pre-investment design review ($20M gate) · brutally honest |
| **Panel** | YC/Sequoia partners · Google Staff PM · MS Principal Architect · Amazon Principal Eng · Stripe Product Lead · LinkedIn Product Director · Indeed Search Architect · Govt-Recruitment Domain Expert · AI/Enterprise/Security/Data Architects |
| **Verdict (headline)** | Strong product *vision*, not yet an investment-grade PRD. Fund with conditions; the v3.0 rewrite (`PRD.md`) resolves the blockers. |
| **Companion** | Rewritten PRD → `docs/00_Project/PRD.md` (v3.0) |

> This review destroys the document professionally so that what survives is fundable. It is
> organized as: Phase 1 deep audit → Phase 2 section scores → Phase 3 founder scale stress-test →
> Phase 4 missing-modules matrix → Phase 6 final scorecard. (Phase 5, the rewrite, is a separate
> file.)

---

## PHASE 1 — Deep audit (what's missing, weak, or unrealistic)

### 1. Business & monetization — **critical gap**
- **No revenue model at all.** For a platform meant to absorb $20M and serve 100M users, v2.0 has
  zero pricing, packaging, or unit economics. This alone blocks investment.
- No TAM/SAM/SOM, no willingness-to-pay hypothesis, no B2B/institutional line, no ads policy, no
  Form-Filling-Service pricing despite it being an obvious paid service.
- No cost model: AI inference, OCR, crawling, notifications (SMS is expensive at scale) all cost
  money per user; nothing budgets for it. Contribution margin is undefined.

### 2. Growth — **missing**
- SEO is one NFR bullet, not a strategy — yet government-job search is the single largest organic
  acquisition channel in this category. No entity/profile pages (organizations, exams, skills) that
  are the SEO backbone. No referral system, no virality loop, no retention loops beyond deadline
  reminders. No growth model.

### 3. Data architecture at scale (product-level) — **critical gap**
- **Naive deduplication.** v2.0 dedupes "by checksum." At 100k sources the same recruitment appears
  in dozens of formats; the real problem is **semantic dedup + entity resolution**, which is
  unaddressed. Without it, users see the same job 15 times and trust collapses.
- **No canonical entity model** for Organizations, Departments, Exams, Qualifications, Skills,
  Certifications. Everything hangs off free-text on the Opportunity. This is the root cause of most
  later scale problems (search quality, trends, profiles, analytics).
- **No source registry or source-health monitoring** as first-class product concepts. At 100k
  sources, "a crawler broke" must be a monitored, triaged, SLA'd product surface — not a footnote.

### 4. Historical & trends data — **missing, and expensive to add late**
- No **Cutoff History, Recruitment History, Vacancy Trends, or Salary Trends.** These are core
  differentiators (Glassdoor-like), major retention and SEO drivers, and — critically — require
  **capturing data from day one**. Adding them in V3 without having captured history is impossible.
  This is a design-time decision the PRD fails to make.

### 5. AI governance — **weak**
- "Grounding" is stated as a principle but there is **no AI governance system**: no model lifecycle,
  no evaluation harness, no hallucination/accuracy measurement, no prompt-injection defense, no
  policy for PII in prompts, no human-oversight thresholds, no model/version registry, no red-team,
  no cost/latency budgets, no fallback behavior when the model is uncertain or down.
- For an "AI-first" product this is the difference between a demo and a fundable company.

### 6. Security, privacy & compliance — **partial**
- Good posture (encryption, least privilege, audit) but **no consent-management model**, no **DPDP**
  specifics (data-subject rights, purpose limitation, retention schedules, grievance officer), no
  handling of **minors** (many aspirants are 17–18), no data-residency stance, no breach-response
  plan. For a citizen-PII product these are table stakes.
- **No fraud / trust-&-safety** at all. Government-job scams are rampant in India; the platform will
  be impersonated and used to post fake jobs. There is no fake-listing detection, no
  executive-fraud controls in Form Filling, no document-tampering checks, no abuse reporting.

### 7. Operations — **incomplete**
- Reviewer + Admin exist, but there is **no Support workflow, no escalation/grievance workflow, no
  incident/on-call model, no content-correction propagation guarantees, no takedown process, no
  SLA numbers.** At scale, ops is the product.

### 8. Analytics & experimentation — **missing**
- No product-analytics event taxonomy, no experimentation/**A/B** framework, no metric governance.
  You cannot run search ranking, notifications, or growth without this. "Data-driven" is asserted,
  not enabled.

### 9. Search & ranking — **underspecified**
- Ranking is one sentence ("relevance × eligibility × match × deadline"). At Indeed scale, ranking
  is a governed subsystem needing a quality-measurement loop, A/B, spam/fraud suppression,
  freshness, and per-segment tuning. None of this is required in the PRD.

### 10. UX depth, edge cases & missing journeys — **thin**
- Missing edge cases: duplicate/conflicting listings, exam postponement, result revision, provisional
  vs final cutoffs, multi-stage exams, age-relaxation stacking, PwD scribe rules, domicile edge
  cases, shared-device safety, form-fill failure/refund, notification storms on result day.
- Missing journeys: account recovery, grievance/complaint, reporting a fake job, correcting a wrong
  eligibility result, a premium upgrade/downgrade, an institution publishing directly, a support
  ticket, a data-deletion request.
- Accessibility and localization are asserted but not specified to a build-ready depth; offline is
  hand-waved as "future" with no capture strategy.

### 11. Missing first-class modules — **~40 items** (see Phase 4 matrix)
Organization/Department/Exam/Qualification/Skill **profile pages**, Career Paths, Learning Roadmaps,
Certification Recommendations, Government Schemes, Career News, Community, Fraud Detection, Feedback,
Premium/Revenue/Referral/Growth, A/B, Disaster Recovery, Backup, and more.

---

## PHASE 2 — Section scores (v2.0), 1–10

| § | Section | Score | Why · blockers · debt · missed opportunity |
|---|---|---|---|
| 1 | Vision | 8 | Sharp, differentiated (Career DNA). *Missed:* business/market framing absent. |
| 2 | Goals & non-goals | 6 | Clear product goals; **no business goals or monetization goals**. |
| 3 | Personas | 6 | Good aspirant set; **missing** institutional, premium, support personas; shallow accessibility persona. |
| 4 | Principles | 8 | Excellent and binding. Minor: no "measure everything" principle. |
| 5 | Info architecture | 6 | Clean facet model; **omits** entity profiles, trends, schemes, news, growth. |
| 6 | Domain model | 6 | Opportunity/Facet is strong; **no canonical Organization/Exam/Qualification/Skill/Source entities** → root scale risk. |
| 7 | Opportunity taxonomy | 8 | Facet approach is the best idea in the doc. *Debt:* entity resolution unaddressed. |
| 8 | Lifecycle & states | 7 | Good; missing postponement/revision/dispute states. |
| 9 | Skills Engine | 7 | Differentiator; **taxonomy governance at scale and certification reference data undefined**. |
| 10 | Career DNA | 8 | Flagship, compelling; needs explicit scoring/time-to-eligibility definition + career paths + learning roadmaps as first-class. |
| 11 | AI modules | 6 | Good catalogue; **no AI governance/eval/safety-ops** behind them. |
| 12 | Profile | 6 | Solid fields; **no profile-data verification, no consent granularity, no minors handling**. |
| 13 | Form Filling | 6 | Good consent stance; **no fraud controls, refunds, executive-abuse prevention, SLA**. |
| 14 | Dashboard | 7 | Good widget set; no personalization governance or empty-states. |
| 15 | Search | 5 | Filters strong; **ranking is one sentence**; no quality loop, A/B, or spam control. |
| 16 | Admin | 6 | Reasonable; **no support/escalation/grievance/incident** workflows. |
| 17 | Ingestion | 5 | **Checksum dedup is naive**; no entity resolution, source registry, source health, legal/robots governance. |
| 18 | Notifications | 7 | Good anti-fatigue; no cost model (SMS), no storm control on result day. |
| 19 | NFRs | 6 | Targets partial; **no DR/backup/RTO-RPO, cost, or ranking SLAs**; offline hand-waved. |
| 20 | Competitive advantage | 7 | Good narrative; not tied to a defensible business/moat with numbers. |
| 21 | Roadmap | 6 | Phased, but doesn't sequence the ~40 missing modules or monetization. |
| 22 | Metrics | 6 | North Star good; **no event taxonomy, per-module KPIs, cost or AI-quality metrics**. |
| 23 | Risks | 7 | Solid list; missing fraud, compliance, cost, key-person, model risk. |
| 24 | Assumptions | 7 | Reasonable; no market/monetization assumptions. |
| 25 | Open questions | 6 | Useful; misses the big ones (revenue, data residency, entity resolution). |
| 26 | Out of scope | 8 | Appropriately disciplined. |

**Cross-cutting blockers (must-fix before funding):** (B1) no monetization, (B2) no data-at-scale/
entity-resolution strategy, (B3) no AI governance, (B4) no fraud/trust-&-safety, (B5) no
compliance/consent model, (B6) no analytics/experimentation, (B7) missing entity-profile & trends
modules that must be designed from day one.

---

## PHASE 3 — Founder scale stress-test

**Scenario:** 100M users · 50M profiles · 100k official sources · all government opportunities ·
AI-first · multi-language · mobile-first · international-ready.

**Does v2.0 survive? No — it breaks in seven predictable places.**

| At scale, this happens | v2.0 gap | Consequence | v3.0 fix |
|---|---|---|---|
| The same recruitment arrives from 40 sources in 40 formats | Checksum-only dedup | Users see 40 duplicates; trust dies | Canonical entity resolution + semantic dedup (v3.0 §7, §25) |
| 100k crawlers, hundreds failing daily | No source registry/health | Silent staleness; missed recruitments | Source Registry + Source Health Monitoring as products (v3.0 §26) |
| AI answers eligibility for 100M users | No AI governance/evals/cost budget | Hallucinated eligibility at scale = legal + trust catastrophe; runaway inference cost | AI Governance system with evals, grounding gates, cost budgets (v3.0 §16) |
| Result day: 20M users hit simultaneously | Notifications/search have no storm strategy | Outage on the most important day | Surge design, digesting, backpressure requirements (v3.0 §19, §35) |
| Scammers post fake government jobs | No fraud/trust-&-safety | Platform becomes a scam vector; brand ruin | Fraud Detection + Trust & Safety (v3.0 §28) |
| Users want cutoff/vacancy trends after 3 years | History never captured | Cannot build the feature; competitor wins | Historical data captured from day one (v3.0 §11) |
| Company must make money to fund all this | No revenue model | Burns $20M with no path to margin | Monetization + unit economics (v3.0 §30) |

**Additional scale truths v2.0 ignores:** entity resolution is the hardest data problem here and
must be a day-one design decision; SEO via entity/profile pages is the cheapest 100M-user
acquisition channel and must be architected early; AI cost per active user must be a tracked metric
or margins evaporate; compliance (DPDP, minors, grievance) becomes a regulatory blocker, not a
backlog item, the moment you cross a few million users.

**Verdict:** v2.0 is a fundable *vision* but would not survive contact with 100M users. The v3.0
rewrite is designed to.

---

## PHASE 4 — Missing-modules coverage matrix

Status in **v2.0**, and confirmation that **v3.0** (`PRD.md`) closes every gap.

| Module / capability | v2.0 | v3.0 section |
|---|---|---|
| Government Jobs | ✅ Covered | §9 |
| Results | ✅ Covered | §9.4 |
| Admit Cards | ✅ Covered | §9.4 |
| Answer Keys | ✅ Covered | §9.4 |
| Exam Calendar | ✅ Covered | §9.5 |
| Scholarships | ✅ Covered | §9.3 |
| Fellowships | ✅ Covered | §9.3 |
| Internships | ✅ Covered | §9.3 |
| Apprenticeships | ✅ Covered | §9.3 |
| Research (jobs) | ✅ Covered | §9.2 |
| Contract Jobs | ✅ Covered | §9.2 |
| Permanent Jobs | ✅ Covered | §9.2 |
| Skill-based Careers | ✅ Covered | §12 |
| AI Career Guidance | ✅ Covered | §13, §15 |
| Resume Builder | ✅ Covered | §15 |
| Resume Parser | ✅ Covered | §15 |
| Document Vault | ✅ Covered | §20 |
| Application Tracker | ✅ Covered | §20 |
| Notifications | ✅ Covered | §19 |
| Form Filling Service | ✅ Covered | §21 |
| AI Search | ✅ Covered | §18 |
| **Organization Profiles** | ❌ Missing | §8 |
| **Department Profiles** | ❌ Missing | §8 |
| **Exam Profiles** | ❌ Missing | §8 |
| **Qualification Profiles** | ❌ Missing | §8 |
| **Skill Profiles** | ⚠️ Partial | §8, §12 |
| **Career Paths** | ⚠️ Partial | §14 |
| **Certification Recommendations** | ⚠️ Partial | §12, §14 |
| **Government Schemes** | ❌ Missing | §22 |
| **Learning Roadmaps** | ⚠️ Partial | §14 |
| **Government Career News** | ❌ Missing | §23 |
| **Source Registry** | ❌ Missing | §26 |
| **Source Health Monitoring** | ❌ Missing | §26 |
| **Recruitment History** | ❌ Missing | §11 |
| **Cutoff History** | ❌ Missing | §11 |
| **Vacancy Trends** | ❌ Missing | §11 |
| **Salary Trends** | ❌ Missing | §11 |
| **Department Analytics** | ❌ Missing | §11 |
| **Organization Analytics** | ❌ Missing | §11 |
| Skill Taxonomy | ⚠️ Partial | §12.1 |
| Eligibility Engine | ✅ Covered | §15, §17 |
| Recommendation Engine | ✅ Covered | §15, §18 |
| Review Workflow | ✅ Covered | §27 |
| Admin Workflow | ✅ Covered | §27 |
| Reviewer Workflow | ✅ Covered | §27 |
| **Support Workflow** | ❌ Missing | §27 |
| Audit Logs | ✅ Covered | §33 |
| **Fraud Detection** | ❌ Missing | §28 |
| **Feedback System** | ❌ Missing | §29, §31 |
| **Community Features (future)** | ❌ Missing | §24 |
| **Premium Features** | ❌ Missing | §30 |
| **Revenue Model** | ❌ Missing | §30 |
| **Growth Engine** | ❌ Missing | §31 |
| **Referral System** | ❌ Missing | §31 |
| **SEO Strategy** | ⚠️ NFR-only | §31 |
| **Analytics** | ❌ Missing | §29 |
| **A/B Testing** | ❌ Missing | §29 |
| Accessibility | ⚠️ Asserted | §38 |
| **Offline Support** | ⚠️ Hand-waved | §35, §37 |
| Localization | ⚠️ Shallow | §37 |
| **Disaster Recovery** | ❌ Missing | §36 |
| Retention | ⚠️ Partial | §31, §40 |
| **Backup** | ❌ Missing | §36 |
| **Search Ranking** | ⚠️ One line | §18 |
| **AI Governance** | ❌ Missing | §16 |
| **Legal Compliance** | ❌ Missing | §34 |
| Privacy | ⚠️ Partial | §33, §34 |
| **Consent** | ⚠️ Partial | §34 |
| Role-based Permissions | ✅ Covered | §33 |

**Score:** v2.0 fully covers ~21 of ~68 checked capabilities; ~24 are missing outright and ~23 are
partial/asserted. v3.0 covers all of them.

---

## PHASE 6 — Final scorecard

Honest scores for the **reviewed v2.0**, and the scores the **v3.0 rewrite** is designed to achieve.

| # | Dimension | v2.0 | v3.0 (target) | Note |
|---|---|---|---|---|
| 1 | **Overall** | 6.0 | 8.7 | Vision strong; execution completeness added |
| 2 | **Investment readiness** | 4.0 | 8.5 | Monetization, unit economics, growth now present |
| 3 | **Engineering readiness** | 5.0 | 8.5 | Entity model, ingestion at scale, DR, ranking specified |
| 4 | **Product readiness** | 7.0 | 9.0 | Entity profiles, trends, schemes, news, community added |
| 5 | **Scalability** | 4.0 | 8.5 | Entity resolution, source health, surge, cost model |
| 6 | **AI readiness** | 5.0 | 9.0 | Full AI governance, evals, safety, grounding gates |
| 7 | **UX readiness** | 6.0 | 8.5 | Edge cases, journeys, accessibility, offline, localization |
| 8 | **Security readiness** | 6.0 | 9.0 | Consent, DPDP, fraud, DR, minors, breach response |
| 9 | **Monetization readiness** | 2.0 | 8.5 | Freemium + services + B2B + guardrailed ads |
| 10 | **Long-term maintainability** | 6.0 | 8.5 | Governance for taxonomy, data, AI, and model versions |

**Investment recommendation:** *Fund with conditions.* The idea, differentiation (Career DNA +
Skills Engine + verified data), and the facet-based product model are genuinely strong. The v2.0
document was not fundable as written because it lacked a business model, data-at-scale strategy, AI
governance, trust-&-safety, and compliance. **The v3.0 rewrite (`docs/00_Project/PRD.md`) is written
to be the fundable, build-ready, decade-guiding single source of truth.**
