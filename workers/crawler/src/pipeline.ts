// The ingestion pipeline: fetch (generic adapter) -> normalize -> dedup -> queue for review.
// Publishing is NOT done here — it only happens when you approve via the review CLI (R11).
// Works for any source (seed or CSV-imported) via the config-driven generic adapter.

import { randomUUID } from 'node:crypto';
import * as cheerio from 'cheerio';
import { load, save } from './store.js';
import { config } from './config.js';
import { SOURCES } from './sources.js';
import { normalize } from './normalize.js';
import { fetchListings } from './adapters/generic.js';
import { fetchHtml, fetchBuffer } from './http.js';
import { pdfToText } from './pdf.js';
import { titleTokens, jaccard } from './resolve.js';
import type { CanonicalSource, SourceHealth, SourceId, StoreShape } from './types.js';

// S028 — dedup thresholds. ≥ AUTO ⇒ same recruitment (auto-merge / skip). BORDERLINE..AUTO ⇒
// possibly the same ⇒ keep but flag for a human (Master PRD §7.2 — low-confidence merges go to review).
const SIM_AUTO = 0.85;
const SIM_BORDERLINE = 0.65;

/** S029 — record the outcome of a source run so failures are visible, not silent (§26). */
function upsertHealth(
  store: StoreShape,
  sourceId: SourceId,
  status: SourceHealth['status'],
  data: { fetched: number; added: number; duplicates: number; error: string | null },
): void {
  const now = new Date().toISOString();
  let h = store.health.find((x) => x.sourceId === sourceId);
  if (!h) {
    h = { sourceId, lastRunAt: now, status, fetched: 0, added: 0, duplicates: 0, error: null, consecutiveFailures: 0, totalRuns: 0 };
    store.health.push(h);
  }
  h.lastRunAt = now;
  h.status = status;
  h.fetched = data.fetched;
  h.added = data.added;
  h.duplicates = data.duplicates;
  h.error = data.error;
  h.consecutiveFailures = status === 'failed' ? h.consecutiveFailures + 1 : 0;
  h.totalRuns += 1;
}

/** Seed sources overlaid with (and overridden by) imported sources from the store. */
export function allSources(store: StoreShape): CanonicalSource[] {
  const byId = new Map<string, CanonicalSource>(SOURCES.map((s) => [s.id, s]));
  for (const s of store.sources) byId.set(s.id, s);
  return [...byId.values()];
}

export async function listSourceIds(): Promise<SourceId[]> {
  return allSources(await load()).map((s) => s.id);
}

export interface IngestResult {
  sourceId: SourceId;
  fetched: number;
  added: number;
  duplicates: number;
}

export async function ingest(sourceId: SourceId): Promise<IngestResult> {
  const store = await load();
  const source = allSources(store).find((s) => s.id === sourceId);
  if (!source) {
    throw new Error(`Unknown source '${sourceId}'. Import it (import-sources) or check the id.`);
  }
  if (!store.sources.some((s) => s.id === source.id)) store.sources.push(source);

  let listings;
  try {
    listings = await fetchListings(source);
  } catch (e) {
    // S029 — record the failure so the source shows as unhealthy instead of failing silently.
    upsertHealth(store, sourceId, 'failed', { fetched: 0, added: 0, duplicates: 0, error: (e as Error).message });
    await save(store);
    throw e;
  }

  const now = new Date().toISOString();
  let added = 0;
  let duplicates = 0;

  for (const raw of listings) {
    // S027/S027b (opt-in): read the notice's detail page/PDF to extract close date, vacancies, etc.
    // Text-based PDFs are parsed directly; scanned PDFs yield little text → low confidence → human
    // review (Data Engine PRD §5). Failure is non-fatal.
    if (config.fetchDetails) {
      try {
        if (/\.pdf(?:$|\?)/i.test(raw.detailUrl)) {
          raw.hints = { ...raw.hints, detailText: await pdfToText(await fetchBuffer(raw.detailUrl)) };
        } else {
          const detailHtml = await fetchHtml(raw.detailUrl);
          const detailText = cheerio.load(detailHtml).root().text().replace(/\s+/g, ' ').slice(0, 8000);
          raw.hints = { ...raw.hints, detailText };
        }
      } catch {
        /* detail extraction is best-effort */
      }
    }
    const { notification, opportunity } = normalize(source, raw);

    // Exact semantic signature match (same org + same title token-set, incl. cross-source).
    if (store.opportunities.some((o) => o.dedupKey === opportunity.dedupKey)) {
      duplicates++;
      continue;
    }
    // Fuzzy match within the same organization: high similarity ⇒ duplicate; borderline ⇒ flag.
    const newTokens = titleTokens(opportunity.title);
    let isDuplicate = false;
    for (const o of store.opportunities) {
      if (o.organizationId !== opportunity.organizationId) continue;
      const sim = jaccard(titleTokens(o.title), newTokens);
      if (sim >= SIM_AUTO) { isDuplicate = true; break; }
      if (sim >= SIM_BORDERLINE && !opportunity.possibleDuplicate) {
        opportunity.possibleDuplicate = true;
        opportunity.possibleDuplicateOf = o.id;
      }
    }
    if (isDuplicate) {
      duplicates++;
      continue;
    }

    store.notifications.push(notification);
    store.opportunities.push(opportunity);
    store.reviewTasks.push({
      id: `rev_${randomUUID()}`,
      opportunityId: opportunity.id,
      sourceId,
      status: 'created',
      createdAt: now,
      decidedAt: null,
      notes: null,
    });
    added++;
  }

  upsertHealth(store, sourceId, listings.length === 0 ? 'empty' : 'ok', {
    fetched: listings.length,
    added,
    duplicates,
    error: null,
  });
  await save(store);
  return { sourceId, fetched: listings.length, added, duplicates };
}
