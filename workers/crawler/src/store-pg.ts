// S030 — Postgres store backend. Same load()/save() contract as the JSON store, so the pipeline is
// unchanged. load() reads all rows into the StoreShape; save() upserts every row in one transaction
// (the crawler's scale is small; the platform in Part 2 will use granular queries against this schema).

import pg from 'pg';
import { config } from './config.js';
import type {
  StoreShape,
  CanonicalSource,
  SourceHealth,
  RawNotification,
  CanonicalOpportunity,
  ReviewTask,
} from './types.js';

let pool: pg.Pool | null = null;
function db(): pg.Pool {
  if (!pool) pool = new pg.Pool({ connectionString: config.databaseUrl });
  return pool;
}

export async function pgClose(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// ---- row → domain mappers (snake_case columns → camelCase fields) --------------------------------
/* eslint-disable @typescript-eslint/no-explicit-any */
const orNull = <T>(v: T | null | undefined): T | undefined => (v == null ? undefined : v);

function rowToSource(r: any): CanonicalSource {
  return {
    id: r.id,
    name: r.name,
    organizationName: r.organization_name,
    sector: r.sector,
    jurisdiction: r.jurisdiction,
    officialDomain: r.official_domain,
    listingUrl: r.listing_url,
    robotsUrl: r.robots_url,
    keywords: orNull(r.keywords),
    noticeListType: orNull(r.notice_list_type),
    opportunityTypes: orNull(r.opportunity_types),
    priority: orNull(r.priority),
    notes: orNull(r.notes),
  };
}
function rowToHealth(r: any): SourceHealth {
  return {
    sourceId: r.source_id,
    lastRunAt: r.last_run_at,
    status: r.status,
    fetched: r.fetched,
    added: r.added,
    duplicates: r.duplicates,
    error: r.error,
    consecutiveFailures: r.consecutive_failures,
    totalRuns: r.total_runs,
  };
}
function rowToNotification(r: any): RawNotification {
  return {
    id: r.id,
    sourceId: r.source_id,
    rawReference: r.raw_reference,
    checksum: r.checksum,
    extractedText: r.extracted_text,
    fetchedAt: r.fetched_at,
  };
}
function rowToOpportunity(r: any): CanonicalOpportunity {
  return {
    id: r.id,
    notificationId: r.notification_id,
    sourceId: r.source_id,
    organizationName: r.organization_name,
    organizationId: r.organization_id,
    title: r.title,
    opportunityType: r.opportunity_type,
    sector: r.sector,
    officialUrl: r.official_url,
    closeDate: r.close_date,
    vacancyCount: r.vacancy_count,
    noticeYear: r.notice_year,
    examName: r.exam_name,
    extractionConfidence: r.extraction_confidence,
    dedupKey: r.dedup_key,
    possibleDuplicate: r.possible_duplicate,
    possibleDuplicateOf: r.possible_duplicate_of,
    status: r.status,
    verifiedAt: r.verified_at,
    verifiedBy: r.verified_by,
    publishedAt: r.published_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
function rowToReviewTask(r: any): ReviewTask {
  return {
    id: r.id,
    opportunityId: r.opportunity_id,
    sourceId: r.source_id,
    status: r.status,
    createdAt: r.created_at,
    decidedAt: r.decided_at,
    notes: r.notes,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function pgLoad(): Promise<StoreShape> {
  const c = db();
  const [sources, health, notifications, opportunities, reviewTasks] = await Promise.all([
    c.query('SELECT * FROM crawler.sources'),
    c.query('SELECT * FROM crawler.source_health'),
    c.query('SELECT * FROM recruitment.notifications_ingested'),
    c.query('SELECT * FROM recruitment.opportunities'),
    c.query('SELECT * FROM admin.review_tasks'),
  ]);
  return {
    sources: sources.rows.map(rowToSource),
    health: health.rows.map(rowToHealth),
    notifications: notifications.rows.map(rowToNotification),
    opportunities: opportunities.rows.map(rowToOpportunity),
    reviewTasks: reviewTasks.rows.map(rowToReviewTask),
  };
}

export async function pgSave(store: StoreShape): Promise<void> {
  const client = await db().connect();
  try {
    await client.query('BEGIN');
    for (const s of store.sources) {
      await client.query(
        `INSERT INTO crawler.sources
          (id,name,organization_name,sector,jurisdiction,official_domain,listing_url,robots_url,keywords,notice_list_type,opportunity_types,priority,notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO UPDATE SET
          name=EXCLUDED.name,organization_name=EXCLUDED.organization_name,sector=EXCLUDED.sector,
          jurisdiction=EXCLUDED.jurisdiction,official_domain=EXCLUDED.official_domain,listing_url=EXCLUDED.listing_url,
          robots_url=EXCLUDED.robots_url,keywords=EXCLUDED.keywords,notice_list_type=EXCLUDED.notice_list_type,
          opportunity_types=EXCLUDED.opportunity_types,priority=EXCLUDED.priority,notes=EXCLUDED.notes`,
        [s.id, s.name, s.organizationName, s.sector, s.jurisdiction, s.officialDomain, s.listingUrl, s.robotsUrl,
         s.keywords ?? null, s.noticeListType ?? null, s.opportunityTypes ?? null, s.priority ?? null, s.notes ?? null],
      );
    }
    for (const h of store.health) {
      await client.query(
        `INSERT INTO crawler.source_health
          (source_id,last_run_at,status,fetched,added,duplicates,error,consecutive_failures,total_runs)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (source_id) DO UPDATE SET
          last_run_at=EXCLUDED.last_run_at,status=EXCLUDED.status,fetched=EXCLUDED.fetched,added=EXCLUDED.added,
          duplicates=EXCLUDED.duplicates,error=EXCLUDED.error,consecutive_failures=EXCLUDED.consecutive_failures,
          total_runs=EXCLUDED.total_runs`,
        [h.sourceId, h.lastRunAt, h.status, h.fetched, h.added, h.duplicates, h.error, h.consecutiveFailures, h.totalRuns],
      );
    }
    for (const n of store.notifications) {
      await client.query(
        `INSERT INTO recruitment.notifications_ingested
          (id,source_id,raw_reference,checksum,extracted_text,fetched_at)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
        [n.id, n.sourceId, n.rawReference, n.checksum, n.extractedText, n.fetchedAt],
      );
    }
    for (const o of store.opportunities) {
      await client.query(
        `INSERT INTO recruitment.opportunities
          (id,notification_id,source_id,organization_name,organization_id,title,opportunity_type,sector,official_url,
           close_date,vacancy_count,notice_year,exam_name,extraction_confidence,dedup_key,possible_duplicate,possible_duplicate_of,
           status,verified_at,verified_by,published_at,created_at,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
         ON CONFLICT (id) DO UPDATE SET
          close_date=EXCLUDED.close_date,vacancy_count=EXCLUDED.vacancy_count,notice_year=EXCLUDED.notice_year,
          exam_name=EXCLUDED.exam_name,extraction_confidence=EXCLUDED.extraction_confidence,
          possible_duplicate=EXCLUDED.possible_duplicate,possible_duplicate_of=EXCLUDED.possible_duplicate_of,
          status=EXCLUDED.status,verified_at=EXCLUDED.verified_at,verified_by=EXCLUDED.verified_by,
          published_at=EXCLUDED.published_at,updated_at=EXCLUDED.updated_at`,
        [o.id, o.notificationId, o.sourceId, o.organizationName, o.organizationId, o.title, o.opportunityType, o.sector,
         o.officialUrl, o.closeDate, o.vacancyCount, o.noticeYear, o.examName, o.extractionConfidence, o.dedupKey,
         o.possibleDuplicate, o.possibleDuplicateOf, o.status, o.verifiedAt, o.verifiedBy, o.publishedAt, o.createdAt, o.updatedAt],
      );
    }
    for (const t of store.reviewTasks) {
      await client.query(
        `INSERT INTO admin.review_tasks
          (id,opportunity_id,source_id,status,created_at,decided_at,notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status,decided_at=EXCLUDED.decided_at,notes=EXCLUDED.notes`,
        [t.id, t.opportunityId, t.sourceId, t.status, t.createdAt, t.decidedAt, t.notes],
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
