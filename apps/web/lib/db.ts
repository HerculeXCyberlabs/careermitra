// Part 2 seam: the web app reads the SAME Postgres the crawler (Part 1) writes to. Only *published*
// (human-verified) opportunities are ever shown — the verification gate carries through to the UI.
import { Pool } from 'pg';

// Reuse one pool across hot-reloads in dev.
const globalForPg = globalThis as unknown as { pgPool?: Pool };
export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString:
      process.env.DATABASE_URL ?? 'postgres://cm:cm_dev_pw@localhost:5439/careermitra',
  });
if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool;

// Freshness cutoff: hide notices that clearly belong to an earlier year. Notices with no detectable
// year (notice_year IS NULL) are kept — many current listings don't print a year, and hiding them
// would drop genuinely-current jobs.
export const MIN_NOTICE_YEAR = 2026;

export interface JobRow {
  id: string;
  title: string;
  organizationId: string;
  organizationName: string;
  sector: string;
  officialUrl: string;
  vacancyCount: number | null;
  noticeYear: number | null;
  closeDate: string | null;
  publishedAt: string | null;
}

export interface JobFilters {
  q?: string;
  sector?: string;
}

const FRESH = `status = 'published' AND opportunity_type = 'job' AND (notice_year IS NULL OR notice_year >= ${MIN_NOTICE_YEAR})`;

function mapJob(r: Record<string, unknown>): JobRow {
  return {
    id: r.id as string,
    title: r.title as string,
    organizationId: r.organization_id as string,
    organizationName: r.organization_name as string,
    sector: r.sector as string,
    officialUrl: r.official_url as string,
    vacancyCount: (r.vacancy_count as number) ?? null,
    noticeYear: (r.notice_year as number) ?? null,
    closeDate: (r.close_date as string) ?? null,
    publishedAt: (r.published_at as string) ?? null,
  };
}

export async function getPublishedJobs(filters: JobFilters = {}): Promise<JobRow[]> {
  const clauses = [FRESH];
  const params: unknown[] = [];
  if (filters.sector) {
    params.push(filters.sector);
    clauses.push(`sector = $${params.length}`);
  }
  if (filters.q) {
    params.push(`%${filters.q}%`);
    clauses.push(`(title ILIKE $${params.length} OR organization_name ILIKE $${params.length})`);
  }
  const { rows } = await pool.query(
    `SELECT id, title, organization_id, organization_name, sector, official_url,
            vacancy_count, notice_year, close_date, published_at
       FROM recruitment.opportunities
      WHERE ${clauses.join(' AND ')}
      ORDER BY notice_year DESC NULLS FIRST, published_at DESC NULLS LAST
      LIMIT 200`,
    params,
  );
  return rows.map(mapJob);
}

export interface SectorCount {
  sector: string;
  count: number;
}

export async function getSectors(): Promise<SectorCount[]> {
  const { rows } = await pool.query(
    `SELECT sector, count(*)::int AS count
       FROM recruitment.opportunities
      WHERE ${FRESH}
      GROUP BY sector
      ORDER BY count DESC, sector ASC`,
  );
  return rows.map((r) => ({ sector: r.sector as string, count: r.count as number }));
}

export interface JobDetail extends JobRow {
  examName: string | null;
  sourceId: string;
}

export async function getJobById(id: string): Promise<JobDetail | null> {
  const { rows } = await pool.query(
    `SELECT id, title, organization_id, organization_name, sector, official_url,
            vacancy_count, notice_year, close_date, published_at, exam_name, source_id
       FROM recruitment.opportunities
      WHERE id = $1 AND status = 'published'
      LIMIT 1`,
    [id],
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return { ...mapJob(r), examName: (r.exam_name as string) ?? null, sourceId: r.source_id as string };
}

export interface Stats {
  jobs: number;
  organizations: number;
  sectors: number;
}

export async function getStats(): Promise<Stats> {
  const { rows } = await pool.query(
    `SELECT count(*)::int AS jobs,
            count(DISTINCT organization_id)::int AS organizations,
            count(DISTINCT sector)::int AS sectors
       FROM recruitment.opportunities WHERE ${FRESH}`,
  );
  const r = rows[0];
  return { jobs: r.jobs as number, organizations: r.organizations as number, sectors: r.sectors as number };
}
