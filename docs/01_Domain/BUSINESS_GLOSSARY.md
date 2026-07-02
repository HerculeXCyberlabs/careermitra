# CareerMitra — Business Glossary

| | |
|---|---|
| **Product** | CareerMitra — India's AI-powered Government Career Platform |
| **Company** | Astralabs Technologies LLP |
| **Document** | Business Glossary — official definitions of domain terms |
| **Version** | 1.0 |
| **Status** | Authoritative — the single source of truth for what each term *means* |
| **Last updated** | 2026-07-01 |
| **Companion** | `UBIQUITOUS_LANGUAGE.md` (which term to *use*), `DOMAIN_MODEL.md` (how terms relate) |
| **Source of truth** | `docs/00_Project/PRD.md` (v3.0), `docs/01_Domain/DOMAIN_MODEL.md` (v1.0) |

> This glossary defines **what each business term means**. Its sibling, `UBIQUITOUS_LANGUAGE.md`,
> governs **which single term to use** (and which synonyms are banned). Together they ensure the whole
> team — and every AI tool — shares one precise vocabulary, eliminating duplicate concepts and
> ambiguity for the next decade. Definitions are business-level, not technical; no schema or code.

## How to read an entry
**Term** — definition. *(Owning context)* · **Related:** nearby terms · **Not to be confused with:**
the term people most often confuse it with. Where a term is a canonical entity, its name matches
`DOMAIN_MODEL.md` exactly (PascalCase for entities).

## Quick index
People & identity · Reference/canonical · Opportunities & recruitment · Official records · Profile &
career · Scoring & intelligence · Applications & tracking · Documents · Services & commerce · Ingestion
& sources · Governance & trust · AI & governance · Alerts & engagement · Analytics/growth/content ·
DDD & architecture.

---

## 1. People & identity

**Aspirant** — An end user pursuing a government career; the primary human the product serves. Always an **Aspirant**, never "candidate", "job-seeker", or "customer". *(Career)* · **Related:** User, Profile.

**User** — The account identity of any human actor (aspirant or operator). An Aspirant is a User with a Profile; operators are Users with operator roles. *(Identity)* · **Not to be confused with:** Aspirant (a User *plus* a career Profile).

**Operator** — Any internal staff User (Reviewer, Admin, Support agent, Trust & Safety, Executive, Finance). *(Identity)*

**Reviewer** — An operator who verifies and normalizes ingested data at the Verification Gate. *(Administration)* · **Related:** ReviewTask, Verification Gate.

**Executive** — An operator who fulfils a Form Filling ServiceRequest under scoped, time-boxed access. *(Professional Services)* · **Not to be confused with:** an aspirant.

**Role** — A named bundle of permissions (aspirant, reviewer, admin, support, trust-safety, executive, finance). *(Identity)*

**Permission** — An atomic capability, e.g. "publish an opportunity" or "read the vault". *(Identity)*

**Session** — A time-bounded authenticated interaction; central to shared-device safety. *(Identity)*

**ConsentRecord** — A recorded, purpose-specific, revocable grant to use a piece of personal data. Every sensitive-PII use checks a valid ConsentRecord. *(Identity/Compliance)* · **Related:** Consent, Data Sensitivity.

---

## 2. Reference & canonical entities

**Organization** — A canonical government recruiting entity (e.g., SSC, IBPS, DRDO, a specific PSU/university/court). The stable identity used for deduplication, provenance, profiles, and analytics. *(Reference)* · **Not to be confused with:** RecruitmentBoard (the body that *conducts*) or Department (the *parent*).

**Department** *(a.k.a. Ministry / Government Body)* — The parent government body a set of Organizations belongs to. Powers department-level analytics. *(Reference)*

**RecruitmentBoard** — The body that conducts a recruitment/exam on behalf of Organizations (e.g., a Staff Selection body, an RRB). *(Reference)* · **Not to be confused with:** Organization.

**Exam** — A canonical, recurring examination identity (e.g., SSC CGL) that links Results, Admit Cards, Answer Keys, and Cutoffs across years. *(Reference)*

**Skill** — A normalized capability node in the governed Skill Taxonomy (e.g., Splunk, Python). All entered/extracted skills map to one canonical Skill. *(Reference)* · **Not to be confused with:** ProfileSkill (an aspirant's *held* skill with proficiency).

**SkillCategory** — A grouping domain for skills (e.g., Cyber Security, Core Engineering). *(Reference)*

**Skill Taxonomy** — The managed, versioned tree of Skills, SkillCategories, and their synonyms/aliases. *(Reference)* · **Related:** Skill.

**Qualification** — A canonical recognized educational/eligibility qualification (e.g., B.Tech, GATE, NET). *(Reference)* · **Not to be confused with:** ProfileQualification (an aspirant's *held* qualification).

**Certification** — A canonical recognized professional certification (e.g., CEH, Security+) that may be recommended to improve fit. *(Reference)* · **Not to be confused with:** Certificate (an aspirant's *earned* instance).

**Location** — A canonical geography (state, district, city) used for domicile, filters, and analytics. *(Reference)*

---

## 3. Opportunities & recruitment

**Notification** — The **official recruitment announcement** published by a Source (e.g., "SSC released the notification"). It is the **provenance anchor** from which Opportunities are derived; never shown to aspirants directly. *(Recruitment)* · **Not to be confused with:** **Alert** (a message CareerMitra sends to an aspirant). *This is the single most important disambiguation in the product — see `UBIQUITOUS_LANGUAGE.md`.*

**Recruitment** — A **verified recruitment drive** by an Organization/Board (e.g., "SSC CGL 2026") that groups Vacancies, Posts, dates, and stages. The internal aggregate. *(Recruitment)* · **Not to be confused with:** Notification (the raw announcement it was derived from) or Opportunity (its user-facing view).

**Opportunity** — The **verified, deduplicated listing an aspirant discovers** — a job/scholarship/fellowship/internship/apprenticeship view over a Recruitment. The atomic user-facing unit. *(Recruitment)* · **Related:** Facet. · **Not to be confused with:** Recruitment (the internal drive).

**Facet** — A classification dimension of an Opportunity (sector, employment type, opportunity type, level). Categories are *facets of one Opportunity*, not separate modules. *(Recruitment/Search)*

**Vacancy** — A **quantified set of positions** within a Recruitment, usually broken down by Post and reservation category. Answers "how many seats". *(Recruitment)* · **Not to be confused with:** Post (the role) or Opportunity (the listing).

**Post** — A **named role/designation** within a Recruitment (e.g., Assistant Section Officer), carrying its pay level and eligibility criteria. *(Recruitment)* · **Not to be confused with:** Vacancy (the count of that Post).

**ApplicationForm** — The **official form definition/link** for applying to a Recruitment (fields, required documents, fee). CareerMitra never submits it directly. *(Recruitment)* · **Not to be confused with:** Application (the aspirant's engagement).

**GovernmentScheme** — A government scheme (welfare/skilling/scholarship-adjacent) relevant to aspirants, held under the same verification gate as Opportunities. *(Recruitment)*

**CalendarEvent** — A single dated event (open/close/admit/exam/answer-key/objection/result) projected into the unified, personalizable Exam Calendar; marked provisional or confirmed. *(Recruitment)*

**Exam Calendar** — The unified, personalized view of all CalendarEvents relevant to an aspirant. *(Recruitment)* · **Related:** CalendarEvent.

---

## 4. Official records & exam data

**Result** — An official result artefact/announcement for an Exam/Recruitment stage; linked to a canonical Exam for cross-year history. *(Recruitment)*

**Answer Key** *(AnswerKey)* — Provisional or final answer keys with objection windows. *(Recruitment)*

**Admit Card** *(AdmitCard)* — Availability and retrieval reference for an exam admit card. *(Recruitment)*

**Cutoff** — Category-wise qualifying marks for an exam stage/year; the core of Cutoff History. *(Recruitment)* · **Related:** Cutoff History.

**Provisional vs Confirmed** — A status on dates/keys/cutoffs indicating whether a value is tentative (Provisional) or officially fixed (Confirmed/Final). Must always be shown. *(Recruitment)*

**Corrigendum** — An official correction/amendment to a Recruitment (dates, vacancies, eligibility). Triggers re-notification of affected aspirants. *(Recruitment)*

**Recruitment History** — The captured record of past recruitments per Organization/Exam. *(Recruitment/Analytics)*

**Cutoff History / Vacancy Trends / Salary Trends** — Captured, verified time-series that power trends and profiles; captured from day one. *(Recruitment/Analytics)*

---

## 5. Profile & career

**Profile** — An Aspirant's intelligent career identity (demographics, qualifications, skills, experience, preferences, derived scores) — the fuel for eligibility, matching, and Career DNA. *(Career)*

**ProfileSkill** — An aspirant's **held** Skill with proficiency and evidence (resolves the link between Profile and canonical Skill). *(Career)* · **Not to be confused with:** Skill (the canonical node).

**ProfileQualification** — An aspirant's **held** Qualification with institution, year, marks, and evidence. *(Career)*

**Experience** — An aspirant's work/experience entry. *(Career)*

**Certificate** — An aspirant's **earned** certificate instance (distinct from the canonical Certification). *(Career)* · **Not to be confused with:** Certification.

**Resume** — The aspirant's resume artefact (built or uploaded), export-ready. *(Career)*

**Career Path** *(CareerPath)* — A realistic role progression in a domain (e.g., SOC Analyst → Security Officer). *(Career)*

**Career Roadmap / Learning Roadmap** *(CareerRoadmap)* — An ordered plan converting gaps into steps (qualifications → certifications → target recruitments) with time estimates. *(Career)*

**LearningResource** — A recommended preparation/learning resource tied to a Skill/Qualification/roadmap step. *(Career/Growth)*

**SavedJob** *(a.k.a. Bookmark)* — An aspirant's saved Opportunity (shortlist) that feeds the calendar and alerts. *(Career)*

**SavedSearch** — A stored search/filter set that can raise alerts on new matches. *(Career)*

---

## 6. Scoring & intelligence

**Eligibility** — Whether an aspirant meets an Opportunity's published requirements (qualification, age, category relaxations, domicile, etc.). *(AI/Recruitment)*

**EligibilityEvaluation** — The explainable *result* of checking one aspirant against one Opportunity: eligible / not / insufficient-data, with reasons and unverified-input flags. Guidance, never a guarantee. *(AI)*

**Eligibility Score** — A derived measure of how broadly an aspirant qualifies across the Opportunity corpus (breadth of eligibility). A Profile-level signal. *(Career/AI)* · **Not to be confused with:** EligibilityEvaluation (a per-Opportunity verdict).

**Skill Match** *(Skill Match Score, 0–100)* — How well an aspirant's skills cover an Opportunity's required skills (coverage, proficiency, evidence, criticality). *(AI)*

**Profile Match** *(Profile Match Score, 0–100)* — Skill Match combined with a hard eligibility gate and preference alignment. Ineligible cannot score as strong. *(AI)* · **Not to be confused with:** Skill Match (skills only).

**Profile Completion** — An impact-weighted percentage of how complete a Profile is, with the single next-best action surfaced. *(Career)*

**Profile Score** — The headline score inside Career DNA blending completeness, verified credentials, breadth of eligible opportunities, and skill depth. *(Career/AI)*

**Career DNA** — An aspirant's scored, living career identity and plan (Profile Score, eligible-by-skill counts, missing qualifications, recommended certifications, next recruitments, growth path, time-to-eligibility). The flagship. *(Career)*

**Time-to-Eligibility** — An estimate of the fastest realistic time to acquire missing qualifications/certifications for a target. Labeled as an estimate. *(AI/Career)*

**Recommendation** — A ranked, explainable, eligibility-gated suggestion (opportunity, exam, or certification) for an aspirant. Produced by the Recommendation engine. *(AI)*

**Recommendation Engine** — The capability that generates Recommendations; realized by the Recommendation entity and its models. *(AI)*

**Eligibility Engine** — The deterministic capability that produces EligibilityEvaluations. *(AI)*

---

## 7. Applications & tracking

**Application** — An aspirant's **engagement with an Opportunity across its stages** (interested → applied → admit card → exam → result). The tracker unit. *(Career)* · **Not to be confused with:** ApplicationForm (the official form) or Recruitment.

**ApplicationStageHistory** — The immutable, append-only record of each stage transition of an Application. *(Career)*

**Application Tracker** — The aspirant-facing view over their Applications and stages. A read model, not a separate entity. *(Career)*

**Stage** — A named step in an Application's lifecycle (Interested, Applied, AdmitCard, Exam, Result, Closed, Withdrawn). *(Career)*

---

## 8. Documents

**DocumentVault** *(a.k.a. Vault)* — An aspirant's secure store of identity/education documents, reused across resume, applications, and form filling. Highest sensitivity. *(Documents)*

**Document** — A single stored document (marksheet, ID, photo, signature, admit-card copy). *(Documents)*

**VaultAccessLog** — The tamper-evident record of every Vault/Document access, with purpose and consent. *(Documents)*

---

## 9. Services & commerce

**Form Filling Service** — CareerMitra's paid, assisted completion of official application forms — consent-gated, never auto-submitting, never storing external portal credentials. *(Professional Services)*

**ServiceRequest** — An aspirant's request for assisted Form Filling for a specific Opportunity; the aggregate tracking that engagement to proof and rating. *(Professional Services)* · **Related:** Executive, ServiceProof.

**ServiceAssignment** — The scoped, time-boxed grant linking an Executive to one ServiceRequest; auto-revokes on completion. *(Professional Services)*

**ServiceProof** — The downloadable proof of a consented, submitted assisted application. *(Professional Services)*

**ServiceReview** — An aspirant's rating/feedback on a completed ServiceRequest. *(Professional Services)*

**PremiumPlan** — A purchasable subscription plan defining premium entitlements (priority alerts, advanced Career DNA, full trends). Premium adds convenience/insight, never gates basic access. *(Payments)*

**Subscription** *(billing)* — An aspirant's active entitlement to a PremiumPlan. *(Payments)* · **Not to be confused with:** **AlertSubscription** (a standing subscription to alerts — different concept, different context).

**Order** — A purchase intent (subscription or Form Filling Service) capturing what is being bought. *(Payments)*

**Payment** — A money-movement record for an Order, handled via an external provider; no card data stored. *(Payments)*

**Invoice** — The billing document issued for a paid Order. *(Payments)*

**Refund** — A reversal of payment for service failure or eligible cancellation. *(Payments)*

**Entitlement** — What an active Subscription/Order grants (e.g., premium features, an assisted filling). *(Payments)*

---

## 10. Ingestion & sources

**Source** — A registered official source/portal that publishes Notifications; a member of the Source Registry with legal status and a reliability score. *(Crawler)*

**Source Registry** — The canonical registry of every official Source. *(Crawler)*

**Source Health** *(SourceHealth)* — The rolling health/freshness snapshot of a Source (success rate, freshness, drift). Silent failure is an incident. *(Crawler)*

**SourceCategory** — A classification of Sources (central portal, state portal, board, bank, PSU). *(Crawler)*

**Provenance** — The traceable chain from a published fact back to its Notification and Source. Every published fact has provenance. *(Recruitment/Crawler)*

**Ingestion** — The end-to-end pipeline turning raw official information into verified, structured, deduplicated, published data. *(Crawler)*

**Entity Resolution** — Mapping raw Notifications to canonical Organization/Exam/Opportunity identities. *(Crawler)* · **Related:** Semantic Deduplication.

**Semantic Deduplication** — Recognizing that the same recruitment across many sources/formats is *one* Opportunity — beyond checksum matching. *(Crawler)*

**CrawlerJob** — A scheduled/triggered definition of what to crawl for a Source. *(Crawler)*

**CrawlerRun** — A single execution instance of a CrawlerJob. *(Crawler)*

**RawDocument** — A raw fetched artefact (HTML/PDF/image) prior to extraction. *(Crawler)*

**OCRJob** — An OCR extraction task for scanned/image Notifications. *(Crawler)*

**AIParsingJob** — An AI job normalizing extracted text into the canonical model and resolving entities. *(Crawler)* · **Not to be confused with:** ResumeParseJob (aspirant resume parsing, an AI-context job).

---

## 11. Governance, trust & operations

**Verification Gate** — The mandatory human-review checkpoint (an approved ReviewTask) that every Opportunity/record must pass before becoming visible. Nothing unverified is ever shipped. *(Administration)*

**ReviewTask** — A human-review work item for verifying/normalizing ingested data. *(Administration)*

**PublishingWorkflow** — The controlled process that makes an approved record visible, indexes it, captures history, and triggers alerts. *(Administration)*

**ModerationAction / Takedown** — Corrective actions on published content (correction, duplicate merge, withdrawal/takedown). Material corrections re-notify affected aspirants. *(Administration)*

**AuditLog** — The tamper-evident record of operator actions and sensitive-PII accesses. *(Administration)*

**FeatureFlag** — Controlled enablement of features/experiments/rollouts. *(Administration)*

**SupportTicket** — An aspirant-raised support request (account, data, billing, service). *(Support)*

**Grievance** — A formal grievance/redressal case, tracked to resolution under SLA. *(Support)*

**Feedback** — In-product feedback, ratings, and survey responses feeding prioritization. *(Support/Analytics)*

**AbuseReport** — A user/operator report of a fake listing, scam, impersonation, or abuse. *(Support/Trust)*

**Trust & Safety** — The subsystem detecting and managing fraud/scam/abuse. *(Support/Trust)*

**FraudCase / FraudSignal** — A detected fraud/abuse case and the signals that raised it (fake jobs, executive abuse, document tampering, bots). *(Support/Trust)*

**Data Sensitivity Levels** — The classification of data: public, internal, pii, sensitive-pii, secret. Drives handling, consent, and access. *(Security/Compliance)*

---

## 12. AI & AI governance

**Grounding / Grounded AI** — The rule that every AI factual claim resolves to verified data or a cited source; otherwise the surface degrades to "see official source". No fabricated official facts. *(AI)*

**Hallucination** — An AI output stating a fact not supported by verified data; measured and guardrailed. *(AI)*

**Grounding Gate** — The check that blocks or degrades an AI response that cannot be grounded. *(AI)*

**AIModelVersion** — A registered, versioned model/prompt configuration governing an AI capability; every AI output records its version. *(AI)*

**AIEvaluationRun** — An evaluation of a model version against golden datasets (accuracy, grounding fidelity, hallucination rate, bias). Release is blocked on regression. *(AI)*

**Prompt Injection** — An attempt to make an AI treat untrusted content (a notification, resume, web page) as instructions. Defended by treating all such content as data, never commands. *(AI)*

**ResumeParseJob** — An AI job extracting a structured profile from an uploaded resume for aspirant confirmation. *(AI)*

**ResumeBuildJob** — An AI job generating a government-appropriate resume from profile + Vault data. *(AI)*

**AssistantSession** — A grounded conversational session with the AI Career Assistant. *(AI)*

**AI Smart Search** — The capability mapping a natural-language query into structured facets, falling back to verified structured results. *(Search/AI)*

---

## 13. Alerts & engagement

**Alert** — A **message CareerMitra sends to an aspirant** (in-app, push, email, SMS): deadline reminder, admit card released, result out, new matching opportunity, etc. *(Notifications & Engagement)* · **Not to be confused with:** **Notification** (the official recruitment announcement). *In this product, "Notification" is never used to mean an outbound message — that is always an **Alert**. See `UBIQUITOUS_LANGUAGE.md`.*

**AlertTemplate** — A localized, versioned template for an Alert type. *(Notifications & Engagement)*

**AlertPreference** — An aspirant's per-type, per-channel Alert preferences and quiet hours. *(Notifications & Engagement)*

**AlertSubscription** — A standing subscription to Alerts for a SavedSearch, Opportunity, Exam, or Skill. *(Notifications & Engagement)* · **Not to be confused with:** Subscription (billing).

**Channel** — A delivery medium for an Alert (in-app, push, email, SMS). *(Notifications & Engagement)*

**Anti-fatigue** — The frequency caps and relevance thresholds that prevent Alert spam. *(Notifications & Engagement)*

---

## 14. Analytics, growth & content

**AnalyticsEvent** — A governed product event (view, save, apply, alert_sent, dna_run, search, pay) from the event taxonomy; minimized and consented. *(Analytics)*

**MetricDefinition** — The single governed definition of a metric; one definition per metric — no conflicting numbers. *(Analytics)*

**Experiment** *(A/B)* — A controlled experiment with guardrail metrics and a decision log; ranking/alert/growth changes ship behind experiments. *(Analytics)*

**Cohort** — A defined user segment for retention, analysis, or experiment targeting. *(Analytics)*

**North Star** — The single headline metric: Weekly Active Aspirants who take a tracked action on a verified Opportunity. *(Analytics)*

**Referral** — A tracked invite from one aspirant to another, with trust-respecting incentives. *(Growth)*

**Affiliate** — A disclosed, relevance-driven external referral relationship (e.g., certifications); never pay-to-rank. *(Growth)*

**Partner / PartnerOrganization / CoachingPartner** — A B2B/ecosystem partner (institution publisher, skilling/coaching partner). *(Growth)*

**SEOPage** — A server-rendered, structured page for an entity (organization/exam/skill/qualification/opportunity) — the primary acquisition channel. *(Content)*

**CareerNews** — Verified, sourced news relevant to aspirants; every item links to a credible source. *(Content)*

**FAQ / Blog / KnowledgeBaseArticle** — Editorial and help content, reviewed before publish. *(Content)*

---

## 15. DDD & architecture terms

**Bounded Context** — An autonomous part of the domain with its own model and language (e.g., Recruitment, Career, Payments). *(Architecture)*

**Ubiquitous Language** — The one shared, precise vocabulary used by the whole team and all AI tools; governed by `UBIQUITOUS_LANGUAGE.md`. *(Architecture)*

**Entity** — A domain object with a distinct identity and lifecycle (e.g., Opportunity). *(Architecture)*

**Value Object** — A domain object defined only by its attributes, with no identity (e.g., EligibilityResult, Money). *(Architecture)*

**Aggregate / Aggregate Root** — A consistency boundary of related objects, accessed through a single root entity (e.g., the Application aggregate). *(Architecture)*

**Association Entity** — An entity that resolves a many-to-many relationship and carries its own attributes (e.g., ProfileSkill). *(Architecture)*

**Domain Event** — A past-tense business fact that happened (e.g., `OpportunityPublished`), used to integrate contexts. *(Architecture)*

**Read Model / Projection** — A derived, query-optimized view of data (e.g., SearchDocument, Application Tracker). Never a source of truth. *(Architecture)*

**Shared Kernel** — The small canonical model (Reference context) that all contexts agree on and share. *(Architecture)*

**Anti-Corruption Layer** — The translation boundary that converts messy external data into the canonical model without letting it leak inward (used at ingestion). *(Architecture)*

---

*End of Business Glossary v1.0 — the authoritative definitions for CareerMitra's domain vocabulary.
For which term to use (and which synonyms are forbidden), see `UBIQUITOUS_LANGUAGE.md`. This glossary
evolves only through versioned updates aligned with the PRD and Domain Model.*
