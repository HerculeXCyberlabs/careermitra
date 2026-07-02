-- S030 — crawler store schema (idempotent; safe to re-run).
-- Schema-per-bounded-context mirrors docs/04_Database and workers/crawler/src/types.ts.
-- Temporal fields are stored as text to preserve exact ISO strings on round-trip (the platform DB
-- in Part 2 uses real timestamptz/date types; this is the ingestion store).

CREATE SCHEMA IF NOT EXISTS crawler;
CREATE SCHEMA IF NOT EXISTS recruitment;
CREATE SCHEMA IF NOT EXISTS admin;

CREATE TABLE IF NOT EXISTS crawler.sources (
  id                text PRIMARY KEY,
  name              text NOT NULL,
  organization_name text NOT NULL,
  sector            text NOT NULL,
  jurisdiction      text NOT NULL,
  official_domain   text NOT NULL,
  listing_url       text NOT NULL,
  robots_url        text NOT NULL,
  keywords          text[],
  notice_list_type  text,
  opportunity_types text[],
  priority          integer,
  notes             text
);

CREATE TABLE IF NOT EXISTS crawler.source_health (
  source_id            text PRIMARY KEY,
  last_run_at          text NOT NULL,
  status               text NOT NULL,
  fetched              integer NOT NULL,
  added                integer NOT NULL,
  duplicates           integer NOT NULL,
  error                text,
  consecutive_failures integer NOT NULL,
  total_runs           integer NOT NULL
);

CREATE TABLE IF NOT EXISTS recruitment.notifications_ingested (
  id             text PRIMARY KEY,
  source_id      text NOT NULL,
  raw_reference  text NOT NULL,
  checksum       text NOT NULL,
  extracted_text text NOT NULL,
  fetched_at     text NOT NULL
);

CREATE TABLE IF NOT EXISTS recruitment.opportunities (
  id                    text PRIMARY KEY,
  notification_id       text NOT NULL,
  source_id             text NOT NULL,
  organization_name     text NOT NULL,
  organization_id       text NOT NULL,
  title                 text NOT NULL,
  opportunity_type      text NOT NULL,
  sector                text NOT NULL,
  official_url          text NOT NULL,
  close_date            text,
  vacancy_count         integer,
  notice_year           integer,
  exam_name             text,
  extraction_confidence real NOT NULL,
  dedup_key             text NOT NULL,
  possible_duplicate    boolean NOT NULL,
  possible_duplicate_of text,
  status                text NOT NULL,
  verified_at           text,
  verified_by           text,
  published_at          text,
  created_at            text NOT NULL,
  updated_at            text NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_opp_dedup  ON recruitment.opportunities (dedup_key);
CREATE INDEX IF NOT EXISTS idx_opp_status ON recruitment.opportunities (status);
CREATE INDEX IF NOT EXISTS idx_opp_org    ON recruitment.opportunities (organization_id);

CREATE TABLE IF NOT EXISTS admin.review_tasks (
  id             text PRIMARY KEY,
  opportunity_id text NOT NULL,
  source_id      text NOT NULL,
  status         text NOT NULL,
  created_at     text NOT NULL,
  decided_at     text,
  notes          text
);
