# CareerMitra Web (apps/web) — Part 2 first slice

A Next.js app that renders **verified government jobs** read directly from the Postgres database that
the crawler (Part 1, `workers/crawler`) populates. Only `status = 'published'` opportunities (those a
human approved at the verification gate) are shown — the trust boundary carries through to the UI.

This is the **lean vertical slice** of the Platform: Next.js as SSR + BFF, reading Postgres directly.
The full NestJS module structure / OpenSearch / Redis (per `docs/02_Architecture`) are added later.

## Run
```bash
# 1) Make sure the crawler's Postgres is up and has some PUBLISHED jobs
cd ../../workers/crawler
npm run db:up
CM_STORE=pg npx tsx src/cli.ts ingest drdo-rac
CM_STORE=pg npx tsx src/cli.ts review approve <id>   # publish a few

# 2) Run the web app
cd ../../apps/web
npm install
cp .env.local.example .env.local
npm run dev            # http://localhost:3000  → redirects to /jobs
```

## Layout
```
apps/web/
├─ app/
│  ├─ layout.tsx        # root layout + SEO metadata
│  ├─ page.tsx          # / → redirects to /jobs
│  ├─ jobs/page.tsx     # server component: queries Postgres, renders verified jobs
│  └─ globals.css
├─ lib/db.ts            # pg pool + getPublishedJobs() (published + job type only)
└─ next.config.mjs
```

Connection defaults to `postgres://cm:cm_dev_pw@localhost:5439/careermitra` (override with `DATABASE_URL`).
