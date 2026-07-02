# CareerMitra — HANDOFF / START HERE

> **Read this file first.** It is the single entry point to resume work on CareerMitra from exactly
> where it stopped. Any developer, tool, or AI assistant should be able to read this one file and
> continue. Last updated: **2026-07-02**.

---

## 1. What this project is
**CareerMitra** = India's AI-powered government-career platform: discover, understand, apply for, and
plan a public-sector career, powered by grounded, verified data.

**Strategy — build in two parts** (decided and in progress):
1. **Data Engine (Part 1)** — the crawler/ingestion backend that turns official government sources
   into verified, canonical, deduplicated job data. **This is where all current code lives.** ← *we are here*
2. **Platform (Part 2)** — the user-facing product (web app, API, auth, search, Career DNA, etc.).
   **Not started.** It will consume the Data Engine's output via the database (the "seam").

The moat is the **verified data**, so we build data-first, then the platform on top.

---

## 2. Current status (the one-glance version)
- **Planning/docs:** ~90% complete (fundable PRD + architecture + DB/API design + 100-sprint plan).
- **Data Engine (Part 1):** ✅ **MVP complete** (S021–S030) — verified end-to-end on real government sources, persisting to Postgres.
- **Platform (Part 2):** 🔨 **web app working** — `apps/web` (Next.js, SSR) has: landing page w/ live stats, jobs list with **search + sector filters**, **job detail pages + SEO metadata**, and a cookie-based **profile/personalization** page. All read verified jobs from Postgres. NestJS modules / auth / real eligibility still to come.
- **Overall user-facing product:** ~10%. A browsable, filterable app now exists end-to-end.

**Sprints complete:** S001–S009 (foundation + architecture design), **S021–S030** (Data Engine), **+ Part 2 lean slice** (Next.js job page).
**Next:** formalize the monorepo (S010), add **search/filters** (S034/S035), then **profile + eligibility + Career DNA** (S014/S042/S046). See §6.

**Run the app:** `cd workers/crawler && npm run db:up` (with published jobs), then `cd apps/web && npm install && npm run dev` → http://localhost:3000/jobs

Full, authoritative status board: **`docs/09_Sprints/PROJECT_STATUS.md`** (and `.xlsx`).

---

## 3. Where everything is (key docs)
| Doc | What it is |
|---|---|
| `docs/00_Project/prd/PRD.md` | **Master PRD v3.0** — the single source of truth for the whole product |
| `docs/00_Project/prd/DATA_ENGINE_PRD.md` | Data Engine spec + the **human-vs-automation** boundary |
| `docs/09_Sprints/PROJECT_STATUS.md` | **100-sprint status board** — done/next/pending, dependencies, critical path |
| `docs/09_Sprints/Crawler_10_Sources_Tracker.xlsx` | Per-source status/plan (Excel) |
| `docs/02_Architecture/` | System, DB, API, deployment architecture (design) |
| `docs/04_Database/`, `docs/05_API/` | Schema-per-context + API contract design |
| `PROJECT_RULES.md`, `AI_INSTRUCTIONS.md`, `.claude/rules/` | Build rules & conventions to follow |

---

## 4. The working code — `workers/crawler/`
A runnable ingestion worker. Official source → fetch → relevance filter → classify → extract fields →
entity-resolve → semantic-dedup → **human review gate** → publish. Nothing is "published" until a
human approves it (the verification gate, PRD R11).

**Source files (`workers/crawler/src/`):**
| File | Purpose |
|---|---|
| `cli.ts` | Commands: `import-sources`, `sources`, `health`, `ingest`, `review`, `list` |
| `pipeline.ts` | Orchestrates fetch → normalize → dedup → queue; records source health |
| `config.ts` | Env-driven config (UA, delays, TLS, timeouts, detail-fetch) |
| `http.ts` | Polite/resilient fetch (timeout, retry, broken-TLS handling), `fetchBuffer` for PDFs |
| `adapters/generic.ts` + `adapters/extract.ts` | One config-driven adapter for all sources; link extraction + relevance filter |
| `classify.ts` | Opportunity-type classification (job / result / admit_card / answer_key / empanelment) |
| `extract-fields.ts` | Vacancy count + close date + extraction-confidence (feeds the review gate) |
| `pdf.ts` | PDF text extraction (pdf-parse) + glyph-spacing fix |
| `resolve.ts` | Entity resolution (canonical org id) + semantic-dedup helpers (signature, Jaccard) |
| `normalize.ts` | Raw listing → canonical opportunity (provenance, `needs_review`) |
| `store.ts` | JSON store behind a narrow interface (**swap for Postgres at S030 — same interface**) |
| `sources.ts` | Built-in seed sources; CSV registry overrides/extends |
| `import-sources.ts` | Loads the Source Registry CSV |
| `types.ts` | Canonical types (mirror `docs/04_Database`) |

**Source registry:** `workers/crawler/data-intake/source-registry.csv` — **31 government sources**,
including all cybersecurity recruiters (CERT-In, NIC, NCIIPC, NTRO, DRDO, C-DAC, STQC, I4C, RailTel,
BEL, ECIL, BDL, RBI, IDRBT, SEBI, Army, Navy, …). ~19 fetch clean job data today.

---

## 5. How to run the crawler
```bash
cd workers/crawler
npm install                     # first time only
npm run typecheck               # verify it compiles

# Load the source registry (31 sources)
npx tsx src/cli.ts import-sources data-intake/source-registry.csv
npx tsx src/cli.ts sources      # list registered sources
npx tsx src/cli.ts health       # per-source run health (ok/empty/failed/never-run)

# Ingest (fetch candidates into the review queue)
npx tsx src/cli.ts ingest drdo-rac
npx tsx src/cli.ts ingest all

# Review (the human verification gate)
npx tsx src/cli.ts review list          # all awaiting verification (shows type/confidence/dup flags)
npx tsx src/cli.ts review list job      # only open jobs
npx tsx src/cli.ts review approve <id>  # publish (sets provenance)
npx tsx src/cli.ts review reject  <id>
npx tsx src/cli.ts list published       # published items
```

**Environment variables** (defaults are safe; these help with Indian gov sites):
| Var | Purpose |
|---|---|
| `CRAWLER_ALLOW_INSECURE_TLS=true` | Tolerate incomplete `.gov.in` certificate chains (read-only, no creds sent) |
| `CRAWLER_USER_AGENT="Mozilla/5.0 …"` | Some PSU sites block non-browser UAs; a browser UA fetches them |
| `CRAWLER_FETCH_DETAILS=true` | Also fetch each notice's detail page/PDF to extract dates/vacancies (slower) |
| `CRAWLER_REQUEST_DELAY_MS` / `_TIMEOUT_MS` / `_MAX_RETRIES` | Politeness/resilience tuning |
| `CM_DATA_DIR` | Where the JSON store is written (default `./data`) |

Data is written to `workers/crawler/data/store.json` (git-ignored).

---

## 6. What to do next (resume point)
### ✅ Data Engine (Part 1) is DONE — 👉 start Part 2 (the Platform)
The crawler now persists to Postgres (`npm run db:up`, `CM_STORE=pg`). The next work is the
**user-facing product**, which reads those same Postgres tables. Serial order:
- **S010** — bootstrap the monorepo (`apps/`, `services/`, `packages/`), CI, lint, env contract
- **S011** — wire the platform DB / migrations (build on `workers/crawler/db/schema.sql`)
- **S020** — API gateway + shared packages
- **S031 → S033 → S035** — Opportunity service → **first server-rendered job page** → search
- Then the differentiator: **S014 → S041 → S042 → S043 → S046** (profile → eligibility → skills → Career DNA)

This is the first work that produces something a **user can see**. Data Engine deepening
(history/trends capture at ingest, PRD §11) can happen in parallel when needed.

### Deferred / future (don't block on these)
- **S025 / S027c** — JS-rendered sources (CERT-In, NIC, SSC) need a headless browser; and scanned-PDF
  dates need OCR (Tesseract). Both are heavy deps with uncertain payoff from a dev machine — revisit
  when running from an Indian production server. Until then, low-confidence items are correctly
  flagged for human review (they are never published with missing data).

### The critical path to a first *visible* product (from `PROJECT_STATUS.md`)
`S030 (Postgres)` → `S010 (monorepo) → S011 (DB) → S020 (API)` → `S031 → S033 → S035 (opportunity service → detail page → search)`
→ then the differentiator `S014 → S041 → S042 → S043 → S046 (profile → eligibility → skills → Career DNA)`.

---

## 7. Rules to follow (don't skip)
- **Verification gate is sacred:** nothing is published without human approval; never publish
  unverified high-impact data (dates/eligibility). Low confidence ⇒ flag for a human.
- **Official sources only** — never scrape aggregators; always store & show provenance (the official URL).
- **Work in serial sprint order**; don't start a sprint until its "Depends on" are done (`PROJECT_STATUS.md`).
- **PRD is the source of truth**; change scope in the PRD first, then code.
- **Filter cyber (and any skill) at classification, not at the source** — including all cyber-hiring
  orgs is correct; deciding "is this a cyber job?" happens later by reading the notice (S024/skill map).
- After finishing a sprint: update its status in `docs/09_Sprints/PROJECT_STATUS.md` (and `.xlsx`).

---

## 8. How to update this handoff
When the resume point changes (a sprint completes), update **§2 (status)** and **§6 (what's next)**
here, and the status board in `docs/09_Sprints/PROJECT_STATUS.md`. Keep this file to one screen of
"where are we / what's next" — details live in the linked docs.
