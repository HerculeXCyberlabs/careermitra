# CareerMitra — 100-Sprint Master Plan

> The detailed execution plan referenced by `docs/00_Project/prd/PRD.md` §39 (Roadmap).
> The PRD gives **direction and sequencing**; this file gives the **ordered, buildable sprints**.
> Source of record: `docs/sprints_100/CareerMitra_100_Sprint_Master_Plan.xlsx` (this markdown is the
> version-controlled, reviewable rendering — keep the two in sync, or retire the xlsx once this is trusted).

## How to execute (binding rules)
1. **Never skip a sprint.**
2. **Review every sprint** (with a second reviewer / AI) before merging.
3. **Commit after every completed sprint.**
4. **Do not start the next sprint until the current sprint's exit criteria are met.**
5. **Keep the PRD as the single source of truth.**
6. **Update architecture only through approved decisions** (ADRs in `docs/10_ADR`).

## Conventions (apply to every sprint)
- **Sprint prompt:** *"Read PRD, architecture, and the previous sprint. Implement ONLY this sprint. Update docs, tests, and changelog."*
- **Output folder:** the relevant module folder for that sprint.
- **Exit criteria:** all acceptance criteria passed.
- **Depends on:** the immediately preceding sprint (S001 has no dependency).

## Phase overview
| Phase | Sprints | Focus |
|---|---|---|
| Foundation | S001–S005 | Project setup, PRD, domain model, source registry, roadmap |
| Architecture | S006–S010 | Architecture, DB, APIs, monorepo |
| Core Platform | S011–S020 | Auth, users, organizations, skills, resume |
| Crawler & Data | S021–S030 | Source onboarding, parsing, OCR, verification |
| Jobs & Search | S031–S040 | Jobs, search, filters, SEO |
| AI & Profile | S041–S050 | Eligibility, recommendations, Career DNA |
| Applications | S051–S060 | Tracker, form filling, vault, notifications |
| Admin & Ops | S061–S070 | Admin panel, analytics, monitoring |
| Growth & Monetization | S071–S080 | Premium, referrals, partnerships, ads |
| Scale & Quality | S081–S090 | Performance, security, testing, localization |
| Launch & Future | S091–S100 | Launch readiness → public launch → v2 planning |

---

## Foundation — S001–S005
Deliverables: engineering documents and planning.

| Sprint | Objective |
|---|---|
| S001 | Project setup |
| S002 | PRD |
| S003 | Domain model |
| S004 | Source registry |
| S005 | Roadmap |

## Architecture — S006–S010
Deliverables: architecture, DB, APIs, monorepo. (Objectives: "Architecture Sprint 6–10".)

| Sprint | Objective |
|---|---|
| S006 | Architecture Sprint 6 |
| S007 | Architecture Sprint 7 |
| S008 | Architecture Sprint 8 |
| S009 | Architecture Sprint 9 |
| S010 | Architecture Sprint 10 |

## Core Platform — S011–S020
Deliverables: auth, users, organizations, skills, resume. (Objectives: "Core Module 11–20".)

`S011` `S012` `S013` `S014` `S015` `S016` `S017` `S018` `S019` `S020`

## Crawler & Data — S021–S030
Deliverables: source onboarding, parsing, OCR, verification. (Objectives: "Crawler/Data 21–30".)

`S021` `S022` `S023` `S024` `S025` `S026` `S027` `S028` `S029` `S030`

## Jobs & Search — S031–S040
Deliverables: jobs, search, filters, SEO. (Objectives: "Jobs/Search 31–40".)

`S031` `S032` `S033` `S034` `S035` `S036` `S037` `S038` `S039` `S040`

## AI & Profile — S041–S050
Deliverables: eligibility, recommendations, Career DNA. (Objectives: "AI/Profile 41–50".)

`S041` `S042` `S043` `S044` `S045` `S046` `S047` `S048` `S049` `S050`

## Applications — S051–S060
Deliverables: tracker, form filling, vault, notifications. (Objectives: "Applications 51–60".)

`S051` `S052` `S053` `S054` `S055` `S056` `S057` `S058` `S059` `S060`

## Admin & Ops — S061–S070
Deliverables: admin panel, analytics, monitoring. (Objectives: "Admin/Ops 61–70".)

`S061` `S062` `S063` `S064` `S065` `S066` `S067` `S068` `S069` `S070`

## Growth & Monetization — S071–S080
Deliverables: premium, referrals, partnerships, ads. (Objectives: "Growth 71–80".)

`S071` `S072` `S073` `S074` `S075` `S076` `S077` `S078` `S079` `S080`

## Scale & Quality — S081–S090
Deliverables: performance, security, testing, localization. (Objectives: "Scale 81–90".)

`S081` `S082` `S083` `S084` `S085` `S086` `S087` `S088` `S089` `S090`

## Launch & Future — S091–S100
Deliverables: launch readiness.

| Sprint | Objective |
|---|---|
| S091 | Production deployment |
| S092 | Disaster recovery |
| S093 | Observability |
| S094 | Cost optimization |
| S095 | Beta launch |
| S096 | Bug bash |
| S097 | Public launch |
| S098 | Post-launch analytics |
| S099 | Roadmap v2 |
| S100 | Project retrospective & v2 planning |

---

> **Note on generic objectives:** the middle phases (S011–S090) currently carry placeholder objectives
> (e.g. "Core Module 12"). Before starting a phase, expand its sprints with concrete objectives and
> per-sprint acceptance criteria, keeping the phase's deliverables and dependency chain intact.
