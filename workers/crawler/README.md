# CareerMitra Crawler — official-source ingestion (SSC, RRB)

A small, runnable ingestion worker that collects government job notices from **official sources**
(starting with **SSC** and **Railway/RRB**), maps them to CareerMitra's canonical model, and puts
them in a **review queue** — nothing becomes "published" until **you verify it** (the verification
gate, R11). This is the honest, moat-building way to get data: official source + provenance +
human verification, never a scraped aggregator.

> **Status: starting skeleton.** The pipeline (fetch → normalize → dedup → review → publish) is
> complete and runs today. Sources are data, not code: one **generic, config-driven adapter**
> (`src/adapters/generic.ts`) serves every source, driven by the Source Registry CSV. Which links
> on a page are real recruitment notices is decided by a defensive keyword filter you tune per
> source (the `keywords` column) — see step 4.

---

## What it does
```
official site ──fetch──▶ adapter (SSC / RRB) ──▶ normalize ──▶ dedup ──▶ review queue ──you approve──▶ published
                         (extract notices)      (+provenance)            (needs_review)     (R11 gate)   (verified)
```
Data maps 1:1 to the schema you designed in `docs/04_Database` (`crawler.sources`,
`recruitment.notifications_ingested`, `recruitment.opportunities`, `admin.review_tasks`), so moving
from this local JSON store to Postgres later is a swap, not a rewrite.

## Requirements
- Node.js **20+** (for global `fetch`).

## Setup
```bash
cd workers/crawler
npm install
cp .env.example .env      # optional; sensible defaults work out of the box
```

## Run
```bash
# 0) Load the Source Registry (SSC + RRB are also built-in seeds, so this is optional to start)
npx tsx src/cli.ts import-sources data-intake/source-registry-template.csv
npx tsx src/cli.ts sources               # list registered sources + their ids

# 1) Fetch candidates from a source (by id) into the review queue
npx tsx src/cli.ts ingest ssc
npx tsx src/cli.ts ingest upsc
npx tsx src/cli.ts ingest all

# 2) See what's waiting for your verification
npx tsx src/cli.ts review list

# 3) Verify each one against the OFFICIAL notice, then publish or reject
npx tsx src/cli.ts review approve opp_xxxxxxxx
npx tsx src/cli.ts review reject  opp_xxxxxxxx

# 4) Inspect the store
npx tsx src/cli.ts list                 # all
npx tsx src/cli.ts list published       # only verified/published
```
Data is written to `./data/store.json`. (Typecheck with `npm run typecheck`, compile with `npm run build`.)

## Storage: JSON (default) or Postgres (S030)
By default the store is a local JSON file. To use **Postgres** (the same interface, no pipeline change):
```bash
npm run db:up                          # start Postgres in Docker (schema auto-applied)
export CM_STORE=pg                     # or set CM_STORE=pg in .env
npx tsx src/cli.ts import-sources data-intake/source-registry.csv
npx tsx src/cli.ts ingest drdo-rac
npx tsx src/cli.ts review list job
npm run db:down                        # stop (data kept in the cm_pgdata volume)
```
Connection defaults to `postgres://cm:cm_dev_pw@localhost:5439/careermitra` (override with `DATABASE_URL`).
Schema lives in `db/schema.sql` (schemas `crawler` / `recruitment` / `admin`, mirroring `docs/04_Database`).
This is the **seam to the Platform (Part 2)**: a backend API reads these same Postgres tables.

## Step 4 — tuning a source (the one part you finish)
Because government pages differ, the generic adapter filters links by **keywords**. If an ingest
prints `0 candidates`:
1. Open the source's `notice_list_url` in a browser (the CSV column, or `listingUrl` for the seed
   sources in `src/sources.ts`).
2. Right-click a real recruitment link → **Inspect**, and confirm where the notice list lives (it may
   be a sub-page, or JavaScript-rendered — if so, point `notice_list_url` at the notice page directly).
3. Adjust that source's `keywords` (pipe-separated regex in the CSV) to match the real titles.

That's the whole loop — **no code changes to add a source**: add a row to the CSV and re-import.
RRB especially is federated across ~21 regional boards — add them one row at a time.

## Be a good citizen (legal / robots)
- These are **public government** sites, but we crawl responsibly: an identifiable `User-Agent`,
  a **rate-limit delay** between requests, and a minimal **robots.txt** check (all in `.env`).
- Before scaling up a source, glance at its `robots.txt` and terms. Keep the delay conservative.
- We store the **official URL** as provenance and always link users to it — we never claim authority
  we don't have. **We do not scrape aggregators** (FreeJobAlert/Sarkari/Testbook) — official only.

## What's intentionally NOT here yet (later stages)
OCR of scanned PDFs · AI field extraction (exact dates/eligibility/vacancies) · semantic dedup across
many sources · automated source-health monitoring · Postgres store. Add these when manual work hurts.

## Layout
```
workers/crawler/
├─ src/
│  ├─ cli.ts            # commands: import-sources / sources / ingest / review / list
│  ├─ config.ts         # runtime config from env (user-agent, delay, robots, data dir)
│  ├─ pipeline.ts       # fetch → normalize → dedup → queue (seed + imported sources)
│  ├─ import-sources.ts # load the Source Registry CSV (dependency-free CSV parser)
│  ├─ normalize.ts      # raw listing → canonical opportunity (+provenance, needs_review)
│  ├─ sources.ts        # built-in seed sources (SSC, RRB) — the CSV overrides/extends these
│  ├─ store.ts          # JSON store (swap for Postgres later, same interface)
│  ├─ http.ts           # polite fetch + robots check
│  ├─ types.ts          # canonical types (mirror docs/04_Database)
│  └─ adapters/
│     ├─ extract.ts     # shared, defensive link extraction (cheerio)
│     └─ generic.ts     # one config-driven adapter for every source
├─ data-intake/
│  ├─ source-registry-template.csv  # the Source Registry (~2000 sources go here)
│  └─ COLUMN_GUIDE.md               # how to fill each CSV column
└─ data/store.json      # created on first run (git-ignored)
```
