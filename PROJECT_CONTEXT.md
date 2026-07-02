# PROJECT_CONTEXT.md — CareerMitra

> **Read this first.** Every engineer and every AI tool starts here. If any other document
> contradicts this file, this file wins and the other document is treated as a defect.
>
> **Project:** CareerMitra · **Company:** Astralabs Technologies LLP
> **Repository root:** `D:\Astralabs\CareerMitra` · **Status:** long-term product (not a demo)

---

## 1. What CareerMitra is

CareerMitra is a **Government Career platform for India**. It is the trusted companion
(*mitra* = companion/friend) for a citizen's entire public-sector journey — from discovering
an opportunity, to checking eligibility, to preparing documents, to tracking an application,
to receiving the result.

The product exists to solve three problems for Indian aspirants:

1. **Discovery is fragmented** — notifications are scattered across hundreds of official
   portals in inconsistent formats.
2. **Eligibility is confusing** — age, education, category and domicile rules are hard to
   parse and easy to get wrong.
3. **The journey is stressful** — deadlines are missed, documents are lost, forms are
   error-prone, and results/admit cards are hard to track.

CareerMitra removes that friction while holding an absolute bar on **trust and accuracy**,
because this is government-adjacent: a wrong deadline or a wrong eligibility answer causes
real harm.

---

## 2. The platform capabilities (canonical module set)

These fourteen capabilities are the **canonical modules** of CareerMitra. Every doc, folder,
branch and AI prompt refers to them by the same names. They are grouped into three domains.

### A. Discovery & official records
| Module | What it does | Data character |
|---|---|---|
| **Government Jobs** | Discover verified government job opportunities | Public listings |
| **Results** | Surface and track exam results | Public + aspirant-linked |
| **Admit Cards** | Surface and retrieve admit cards | Public + aspirant-linked |
| **Scholarships** | Discover scholarship opportunities | Public listings |
| **Internships** | Discover government/PSU internships | Public listings |
| **Apprenticeships** | Discover apprenticeship opportunities | Public listings |

### B. Aspirant tools
| Module | What it does | Data character |
|---|---|---|
| **Resume Builder** | Build a structured, export-ready resume | Aspirant PII |
| **Resume Parser** | Extract structured profile data from an uploaded resume | Aspirant PII |
| **Document Vault** | Securely store identity/education documents | **Sensitive PII (highest)** |
| **Application Tracker** | Track applications, stages, deadlines across opportunities | Aspirant PII |

### C. Intelligence & automation
| Module | What it does | Data character |
|---|---|---|
| **Eligibility Engine** | Evaluate an aspirant against an opportunity's rules | Reads PII, deterministic |
| **Notification Engine** | Deliver deadline/result/admit-card alerts across channels | Aspirant contact PII |
| **AI Career Assistant** | Answer questions and guide the journey, grounded in verified data | Reads PII, **must be grounded** |
| **Form Filling Service** | Assist filling official application forms from vault + profile | **Sensitive PII, consent-gated** |

> The precise, machine-readable version of this table (ids, dependencies, sensitivity) lives
> in `PROJECT_MANIFEST.json → modules`. Keep the two in sync.

---

## 3. Who we build for

- **Aspirants (primary users):** students and job-seekers preparing for exams such as SSC
  CGL, IBPS PO, UPSC, RRB and state PSCs. They are **mobile-first**, often on constrained
  data, frequently reading in a **second language**. Trust and clarity beat cleverness.
- **Institutions:** departments and boards whose notifications we ingest and represent.
- **Internal teams:** content-operations (verify data), support, and engineering.

---

## 4. Product principles (inherited by every module)

1. **Trustworthy by default.** Accuracy and proof outrank delight. Never guess a deadline,
   eligibility rule, or official fact. Unverified data is not shipped.
2. **Clarity over cleverness.** Plain language, one obvious next step, no dark patterns.
3. **Mobile-first, low-friction.** Works on 3G; 16px minimum body text; 44px touch targets.
4. **A companion, not a form.** Reduce anxiety — surface deadlines, explain eligibility,
   remember documents.
5. **Accessible & multilingual.** WCAG 2.1 AA; English, Hindi and regional scripts.
6. **Consent and privacy are non-negotiable.** The aspirant owns their data; the platform
   never acts on their behalf (e.g. form submission) without explicit consent.

---

## 5. Non-negotiable constraints

- **Data integrity.** Opportunity data (dates, vacancies, eligibility) is sourced, verified
  and auditable. Every record carries provenance back to its official notification.
- **Privacy & security.** Citizen PII is minimized, encrypted, access-logged, and never
  logged in plaintext. The **Document Vault** and **Form Filling Service** are the highest-
  sensitivity subsystems; see `PROJECT_RULES.md` and the security posture in this repo.
- **Grounded intelligence.** The **AI Career Assistant** must ground every factual claim
  (deadlines, eligibility, official process) in verified platform data or cited official
  sources. It never fabricates official facts and never gives guaranteed legal outcomes.
- **Availability under spikes.** Result-day and admit-card traffic is extremely spiky. The
  platform degrades gracefully rather than failing.
- **Compliance.** Aligns with Indian data-protection direction (DPDP), accessibility norms,
  and correct attribution of government content.

---

## 6. Canonical glossary (use these exact terms everywhere)

| Term | Meaning |
|---|---|
| **Opportunity** | Any listing: government job, scholarship, internship, or apprenticeship |
| **Notification** | The official published announcement an Opportunity is derived from |
| **Aspirant** | An end-user pursuing a government career |
| **Journey** | The aspirant's tracked set of opportunities, documents, dates and applications |
| **Eligibility** | The rules (age, education, category, domicile) that gate an Opportunity |
| **Admit Card / Result** | Downloadable official artefacts tied to an exam stage |
| **Vault** | The Document Vault — the aspirant's secure store of identity/education documents |
| **Ingestion** | The pipeline that turns Notifications into verified canonical Opportunities |
| **Verification gate** | The step that blocks unverified data (dates/eligibility) from publish |
| **Grounding** | Basing an AI answer strictly on verified data or cited official sources |

Do not invent synonyms. "Listing", "post", "vacancy detail" all map to **Opportunity**.

---

## 7. What this repository is (and is not)

- **It is** the **Engineering Foundation** of CareerMitra: the rules, documentation spine,
  conventions, governance and AI memory that all future work follows for 10+ years.
- **It is not** the application. Application code (apps, services, shared packages) is added
  over time **into this foundation**, always obeying `PROJECT_RULES.md`.

The intended long-term repository shape (created as work lands, never all at once):

```
CareerMitra/
├── docs/         Numbered documentation spine — single source of truth
├── apps/         Deployable applications (web, admin)
├── services/     Backend services (per canonical module or domain)
├── packages/     Shared libraries (ui, types, config, sdk)
├── assets/       logos, figma, icons, images
├── tools/        Repo automation (organizer, verification, doc generators)
└── (root docs)   The five governance files below + architecture/security docs
```

---

## 8. Recommended reading order

1. `PROJECT_CONTEXT.md` — *(this file)* what and why.
2. `PROJECT_RULES.md` — the hard rules that gate every change.
3. `AI_INSTRUCTIONS.md` — how AI tools must operate in this repo.
4. `CONTRIBUTING.md` — the human contribution workflow.
5. `PROJECT_MANIFEST.json` — the machine-readable index of all of the above.

If you remember one sentence: **CareerMitra optimizes for the trust of a citizen making a
high-stakes decision — correctness and privacy always outrank speed and cleverness.**
