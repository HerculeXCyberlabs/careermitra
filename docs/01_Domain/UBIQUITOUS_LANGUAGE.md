# CareerMitra — Ubiquitous Language

| | |
|---|---|
| **Product** | CareerMitra — India's AI-powered Government Career Platform |
| **Company** | Astralabs Technologies LLP |
| **Document** | Ubiquitous Language — the one vocabulary the whole team and all AI tools must use |
| **Version** | 1.0 |
| **Status** | Binding — deviations are treated as defects |
| **Last updated** | 2026-07-01 |
| **Companion** | `BUSINESS_GLOSSARY.md` (what each term *means*), `DOMAIN_MODEL.md` (how terms relate) |
| **Source of truth** | `docs/00_Project/PRD.md` (v3.0), `docs/01_Domain/DOMAIN_MODEL.md` (v1.0) |

> The **Ubiquitous Language** is the single, shared, precise vocabulary used **everywhere** — product
> docs, conversations, code, tickets, UI copy (with noted exceptions), API contracts, analytics event
> names, and **every AI tool's output**. Its purpose is to eliminate duplicate concepts and ambiguity:
> one concept → one word, forever. Where the Business Glossary answers *"what does this term mean?"*,
> this document answers *"which term do I use, and which words are banned?"*

---

## 1. Why this exists (the cost of not having it)
Without an enforced vocabulary, a single concept fractures into synonyms — "job", "post", "vacancy",
"notification", "listing" — and teams build **duplicate concepts** that never quite line up. In the
Indian government-recruitment domain this is acute: the word *"notification"* means the official
announcement to a domain expert, but *"notifications"* means push messages to a product engineer.
That one clash alone can produce two incompatible data models. This document makes the decision once,
for everyone.

## 2. Golden rules
1. **One concept, one term.** Use the **Approved Term** from the table below. Never invent synonyms.
2. **Entity names are canonical.** They match `DOMAIN_MODEL.md` exactly (PascalCase), in code, docs,
   and diagrams: `Opportunity`, `ServiceRequest`, `AlertSubscription`.
3. **Respect context.** A term belongs to a bounded context; when speaking across contexts, qualify
   it (e.g., "billing **Subscription**" vs "**AlertSubscription**").
4. **Domain events are past tense** and name the fact, not the mechanism: `OpportunityPublished`,
   `AlertSent` — never `SendAlert` or `NotificationPushed`.
5. **The glossary is the meaning; this is the usage.** If a term isn't here or in the glossary,
   don't coin it — propose it (see §8).
6. **AI tools are bound too.** Every AI-generated document, comment, message, or code identifier must
   use these exact terms (see §6).

---

## 3. Canonical term table

**Approved Term** = use this. **❌ Do NOT use** = banned synonyms that create confusion.

| Approved Term | Means (short) | ❌ Do NOT use | Context |
|---|---|---|---|
| **Aspirant** | The end user pursuing a government career | user*, candidate, job-seeker, customer, applicant | Career |
| **User** | Any account identity (aspirant or operator) | member, account-holder | Identity |
| **Operator** | Any internal staff user | agent (except "Support agent"), staff-user | Identity |
| **Notification** | The **official recruitment announcement** (provenance) | job notification, alert, push, update, message | Recruitment |
| **Recruitment** | A verified recruitment **drive** grouping vacancies/posts | notification, drive, campaign, opening batch | Recruitment |
| **Opportunity** | The verified, deduplicated **listing** an aspirant sees | job, post, listing, vacancy, ad, opening | Recruitment |
| **Vacancy** | The **count of positions** (by post/category) | seat(s) (in prose ok), opening, slot | Recruitment |
| **Post** | A named **role/designation** | position, job, designation-record | Recruitment |
| **ApplicationForm** | The **official form** definition/link | application (that's the aspirant's engagement) | Recruitment |
| **Application** | An aspirant's **engagement with an Opportunity** across stages | submission, application form, entry | Career |
| **Result / AdmitCard / AnswerKey / Cutoff** | Official records | scorecard (except where truly a scorecard), hall ticket→AdmitCard | Recruitment |
| **GovernmentScheme** | A government scheme | scheme-post, welfare-job | Recruitment |
| **CalendarEvent** | One dated event in the Exam Calendar | deadline (in prose ok), date-entry | Recruitment |
| **Organization** | Canonical recruiting entity (SSC, IBPS…) | employer, company, agency, department | Reference |
| **Department** | Parent government body/ministry | organization, ministry-org | Reference |
| **RecruitmentBoard** | Body that **conducts** an exam/recruitment | organization, authority | Reference |
| **Exam** | Canonical recurring examination identity | test, paper, examination-record | Reference |
| **Skill** | Canonical taxonomy node | competency, tag, keyword | Reference |
| **ProfileSkill** | An aspirant's **held** skill (proficiency/evidence) | skill (that's the canonical node) | Career |
| **Qualification** | Canonical qualification (B.Tech, GATE…) | degree (in prose ok), education-record | Reference |
| **Certification** | Canonical professional certification | certificate | Reference |
| **Certificate** | An aspirant's **earned** certificate instance | certification | Career |
| **Profile** | The aspirant's career identity | account, CV-data, dossier | Career |
| **Resume** | The aspirant's resume artefact | CV (in prose ok), bio-data | Career |
| **CareerDNA** | The scored, living career identity/plan | profile score (that's one field), career-graph | Career |
| **CareerRoadmap** | The ordered plan of steps | learning path (ok in prose), track | Career |
| **SavedJob** | A saved Opportunity (shortlist) | bookmark* (ok as UI label), favourite, wishlist | Career |
| **SavedSearch** | A stored search that can alert | saved filter, query-save | Career |
| **EligibilityEvaluation** | Per-Opportunity eligibility **verdict** | eligibility (the concept), eligibility check-result | AI |
| **Eligibility Score** | Profile-level **breadth** of eligibility | eligibility (bare), match score | Career |
| **Skill Match** | Skills-only fit score | match (bare), skill fit | AI |
| **Profile Match** | Eligibility-gated overall fit score | match (bare), profile fit, compatibility | AI |
| **Recommendation** | A ranked, explainable suggestion | suggestion (in prose ok), rec | AI |
| **DocumentVault** | The secure document store | storage, docs, locker (ok in UI) | Documents |
| **Document** | A single stored file | file, attachment, doc | Documents |
| **Form Filling Service** | The paid assisted-filling service | form service, filling, apply-for-me | Professional Services |
| **ServiceRequest** | A request for assisted filling | order (that's Payments), ticket, job | Professional Services |
| **Executive** | Operator who fulfils a ServiceRequest | agent, filler, VA | Professional Services |
| **PremiumPlan** | A purchasable plan | tier (ok in prose), package | Payments |
| **Subscription** | Active entitlement to a PremiumPlan (**billing**) | plan, membership; **not** AlertSubscription | Payments |
| **Order / Payment / Invoice / Refund** | Commerce records | transaction (bare), bill (→Invoice) | Payments |
| **Source** | A registered official portal/feed | site, website, portal (ok in prose), origin | Crawler |
| **Notification (again)** | *(official announcement — see top)* | — | Recruitment |
| **CrawlerRun** | One execution of a CrawlerJob | scrape, fetch-job, crawl | Crawler |
| **OCRJob / AIParsingJob** | Extraction/normalization jobs | parse, extraction (bare) | Crawler |
| **Verification Gate** | Mandatory human-review checkpoint | approval, moderation (that's post-publish) | Administration |
| **ReviewTask** | A human-review work item | review, moderation-task | Administration |
| **PublishingWorkflow** | The publish-and-propagate process | publish, release | Administration |
| **ModerationAction / Takedown** | Post-publish correction/withdrawal | edit, removal | Administration |
| **AuditLog** | Tamper-evident action/access record | log (bare), history | Administration |
| **SupportTicket** | An aspirant support request | ticket (ok in prose), case | Support |
| **Grievance** | A formal redressal case | complaint (ok in prose), escalation | Support |
| **FraudCase** | A fraud/abuse case | scam-report, incident (bare) | Trust & Safety |
| **Alert** | A **message CareerMitra sends** to an aspirant | notification, push, reminder-record, message | Notifications & Engagement |
| **AlertPreference** | Per-type/channel alert settings | notification settings (ok as UI label), prefs | Notifications & Engagement |
| **AlertSubscription** | Standing subscription to alerts | subscription (that's billing), watch | Notifications & Engagement |
| **AnalyticsEvent** | A governed product event | event (bare), log-event | Analytics |
| **Experiment** | An A/B experiment | test (bare), A/B (ok in prose), trial | Analytics |
| **SEOPage** | A generated entity page for discovery | landing page, seo, page (bare) | Content |
| **CareerNews** | Verified, sourced news | news (bare), article | Content |
| **Referral / Affiliate / Partner** | Growth relationships | invite (→Referral), sponsor | Growth |

\* **UI-label exceptions:** end-user UI may show friendlier words (a bell labeled "Notifications", a
"Bookmark" icon, a "Locker"). These are **presentation labels only**. In every domain artifact — data
model, API, events, analytics, docs, AI output, engineering conversation — the **Approved Term** is
used. The UI label never redefines the domain term.

---

## 4. Disambiguation decisions (the confusing pairs)

These are the concept-pairs that break teams. Each is decided once, here.

### 4.1 Notification vs Alert — **the most important decision**
| Concept | Approved term | Definition | Never call it |
|---|---|---|---|
| The **official recruitment announcement** published by a Source (e.g., "SSC released the notification") | **Notification** | The provenance anchor from which Opportunities are derived; never shown to aspirants directly | an "alert" |
| A **message CareerMitra sends** to an aspirant (push/email/SMS/in-app) | **Alert** | Deadline reminder, admit-card-released, result-out, new-match | a "notification" |

**Rule:** the bare word *"notification"* always means the **official announcement**. An outbound
message is **always** an **Alert** (`Alert`, `AlertTemplate`, `AlertPreference`, `AlertSubscription`,
events `AlertSent`/`AlertDelivered`). The bounded context is still named *"Notifications &
Engagement"* (a capability area), but the **entity it owns is `Alert`, not `Notification`**. The
end-user bell may be labeled "Notifications" in the UI — that is a presentation label only.

### 4.2 Recruitment vs Opportunity vs Notification
Three distinct things, often collapsed into "job":
- **Notification** — the raw official announcement (input).
- **Recruitment** — the verified drive grouping vacancies/posts/dates (internal aggregate).
- **Opportunity** — the deduplicated listing an aspirant discovers (user-facing unit).
Say "publish the **Opportunity**", "the **Recruitment** has 3 posts", "we ingested a **Notification**".

### 4.3 Subscription (billing) vs AlertSubscription
- **Subscription** — the aspirant's paid entitlement to a **PremiumPlan** (Payments).
- **AlertSubscription** — a standing subscription to **Alerts** for a saved search/exam/skill
  (Notifications & Engagement). Different context, different lifecycle. Always qualify in speech.

### 4.4 Certification vs Certificate
- **Certification** — the canonical, recognized credential type (e.g., CEH) in Reference.
- **Certificate** — an aspirant's earned instance stored in their Profile/Vault.

### 4.5 Skill vs ProfileSkill
- **Skill** — the canonical taxonomy node.
- **ProfileSkill** — an aspirant's held skill with proficiency/evidence (an association entity).

### 4.6 Qualification vs Post requirement vs Eligibility
- **Qualification** — a canonical credential.
- **Eligibility** — whether an aspirant meets an Opportunity's requirements.
- **EligibilityEvaluation** — the explainable verdict; **Eligibility Score** — a profile-level breadth
  signal. Don't say "eligibility" when you mean a specific verdict or the score.

### 4.7 Application vs ApplicationForm
- **ApplicationForm** — the official form (a property of the Recruitment).
- **Application** — the aspirant's engagement/journey (in Career). Never interchange them.

---

## 5. Naming conventions (how terms appear in artifacts)
| Artifact | Convention | Example |
|---|---|---|
| Entities / aggregates | PascalCase, singular | `Opportunity`, `ServiceRequest`, `AlertSubscription` |
| Domain events | PascalCase, **past tense** | `OpportunityPublished`, `AlertSent`, `EligibilityEvaluated` |
| Bounded contexts | Title case capability name | Recruitment, Career & Journey, Notifications & Engagement |
| Analytics events | snake_case of the approved term | `opportunity_saved`, `alert_sent`, `dna_run` |
| Documents | PascalCase file names | `DOMAIN_MODEL.md`, `BUSINESS_GLOSSARY.md` |
| Source code identifiers | Follow `PROJECT_RULES.md`; the **noun** is the approved term | `Opportunity`, `savedJob`, `alertPreference` |

Consistency with `PROJECT_RULES.md` (naming/versioning) and `DOMAIN_MODEL.md` (entity names) is
mandatory; where any doubt exists, the entity name in `DOMAIN_MODEL.md` wins.

---

## 6. Rules for AI tools (binding)
Every AI tool operating on this repo (assistants, code generators, doc writers, parsers) **must**:
1. Use the **Approved Term** for every concept; never a banned synonym.
2. Use canonical **entity names** exactly as in `DOMAIN_MODEL.md`.
3. Name generated **events** in past tense; **analytics events** as the snake_case of the approved term.
4. Treat the **Notification = official announcement / Alert = outbound message** rule as absolute.
5. When a needed concept has no approved term, **flag it for addition** (do not invent one silently).
6. Follow `AI_INSTRUCTIONS.md` for all other build-time behavior.
This is a correctness requirement: AI output using the wrong term is a defect, same as a human's.

---

## 7. Say this, not that (quick reference)
| Say ✅ | Not ❌ | Why |
|---|---|---|
| "We **ingested a Notification** and published two **Opportunities**." | "We scraped a job posting." | Separates provenance (Notification) from user-facing unit (Opportunity) |
| "**Alert** the aspirant when the **Result** is out." | "Notify / send a notification." | Outbound = Alert; Notification = the announcement |
| "This **Recruitment** has 3 **Posts** and 120 **Vacancies**." | "This job has 3 jobs and 120 jobs." | Recruitment / Post / Vacancy are distinct |
| "Her **Profile Match** is 84; she's **eligible** for 27 **Opportunities**." | "Her match score / eligibility is 84." | Profile Match (score) ≠ Eligibility (gate) |
| "Upgrade to a **PremiumPlan** (a **Subscription**)." | "Buy a subscription to get alerts." | Billing Subscription ≠ AlertSubscription |
| "Add the **Certification** to your **Profile** as a **Certificate**." | "Add the certificate / certification." | Canonical type vs earned instance |
| "The **Opportunity** passed the **Verification Gate** and was **Published**." | "The job got approved." | Precise gate + workflow terms |
| "Create an **AlertSubscription** on that **SavedSearch**." | "Subscribe to that search." | Names the entity and its target |

---

## 8. Governance & change process
- This vocabulary is **binding**; using a banned synonym in a domain artifact is a reviewable defect.
- The Ubiquitous Language **evolves** as the domain is understood better. To add/change a term: propose
  it, update this document **and** the `BUSINESS_GLOSSARY.md` together, and record the decision as an
  ADR in `docs/10_ADR`. The `DOMAIN_MODEL.md` then conforms.
- Precedence when documents disagree: entity **names** → `DOMAIN_MODEL.md`; term **meanings** →
  `BUSINESS_GLOSSARY.md`; term **usage/bans** → this document; product **scope** → `PRD.md`.

### 8.1 Reconciliation log
| Date | Decision | Applied to |
|---|---|---|
| 2026-07-01 | **Notification/Alert split.** Outbound-message entities renamed from `Notification*` to `Alert*` (`Alert`, `AlertTemplate`, `AlertPreference`) with events `AlertSent`/`AlertDelivered`; the entity `Notification` now exclusively means the official announcement. | `DOMAIN_MODEL.md` v1.0 (Notifications & Engagement context, events, matrix, workflows) — reconciled in the same sprint |

---

*End of Ubiquitous Language v1.0 — the one vocabulary for CareerMitra, binding on the whole team and
all AI tools. Read with `BUSINESS_GLOSSARY.md` (meanings) and `DOMAIN_MODEL.md` (relationships).*
