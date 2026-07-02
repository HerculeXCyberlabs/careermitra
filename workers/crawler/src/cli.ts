// CLI entry point.
//   npx tsx src/cli.ts import-sources <file.csv>   load the Source Registry CSV
//   npx tsx src/cli.ts sources                      list registered sources
//   npx tsx src/cli.ts ingest [<id>|all]            fetch candidates into the review queue
//   npx tsx src/cli.ts review list                  show opportunities awaiting verification
//   npx tsx src/cli.ts review approve <id>          verify + publish (sets provenance) — R11 gate
//   npx tsx src/cli.ts review reject  <id>          reject a candidate
//   npx tsx src/cli.ts list [status]                list stored opportunities

import { ingest, listSourceIds, allSources } from './pipeline.js';
import { importSources } from './import-sources.js';
import { load, save } from './store.js';
import type { SourceId } from './types.js';

const [, , command, ...args] = process.argv;

function help(): void {
  console.log(`CareerMitra crawler — official-source ingestion with human verification

  npx tsx src/cli.ts import-sources <file.csv>   Load the Source Registry CSV (~2000 sources)
  npx tsx src/cli.ts sources                      List registered sources
  npx tsx src/cli.ts health                       Per-source run health (ok/empty/failed)
  npx tsx src/cli.ts ingest [<id>|all]            Fetch candidates into the review queue
  npx tsx src/cli.ts review list [type]           Awaiting verification (type: job|result|admit_card|answer_key|empanelment)
  npx tsx src/cli.ts review approve <id>          Verify + publish (sets provenance) — the R11 gate
  npx tsx src/cli.ts review reject  <id>          Reject a candidate
  npx tsx src/cli.ts list [status]                List stored opportunities
`);
}

function runImport(): void {
  const file = args[0];
  if (!file) { console.error('Usage: import-sources <file.csv>'); return; }
  const r = importSources(file);
  console.log(`Imported ${r.imported} source(s); skipped ${r.skipped}; total data rows ${r.total}.`);
  for (const e of r.errors.slice(0, 20)) console.log(`  ! ${e}`);
  if (r.errors.length > 20) console.log(`  ...and ${r.errors.length - 20} more.`);
  console.log(`\nNext:  npx tsx src/cli.ts sources   then   npx tsx src/cli.ts ingest <id>`);
}

function runSources(): void {
  const sources = allSources(load());
  console.log(`${sources.length} registered source(s):`);
  for (const s of sources) console.log(`  ${s.id}  [${s.sector}]  ${s.name}  → ${s.listingUrl}`);
}

function runHealth(): void {
  const store = load();
  const sources = allSources(store);
  const byId = new Map(store.health.map((h) => [h.sourceId, h]));
  const n = (s: string) => store.health.filter((h) => h.status === s).length;
  const never = sources.filter((s) => !byId.has(s.id)).length;
  console.log(
    `Source health: ${sources.length} sources · ${n('ok')} ok · ${n('empty')} empty · ${n('failed')} failed · ${never} never-run\n`,
  );

  // Worst first: failed → empty → ok → never-run.
  const rank = (id: string): number => {
    const h = byId.get(id);
    if (!h) return 3;
    return h.status === 'failed' ? 0 : h.status === 'empty' ? 1 : 2;
  };
  for (const s of [...sources].sort((a, b) => rank(a.id) - rank(b.id))) {
    const h = byId.get(s.id);
    if (!h) {
      console.log(`  never   ${s.id.padEnd(12)} (not yet ingested)`);
      continue;
    }
    const info =
      h.status === 'failed'
        ? `fails=${h.consecutiveFailures}  err=${(h.error ?? '').slice(0, 45)}`
        : `fetched=${h.fetched} added=${h.added} dup=${h.duplicates}`;
    console.log(`  ${h.status.padEnd(6)}  ${s.id.padEnd(12)} ${info}  (last ${h.lastRunAt.slice(0, 16).replace('T', ' ')})`);
  }
}

async function runIngest(): Promise<void> {
  const target = args[0] ?? 'all';
  const ids: SourceId[] = target === 'all' ? listSourceIds() : [target];
  if (ids.length === 0) { console.log('No sources registered. Import the CSV first.'); return; }
  for (const id of ids) {
    process.stdout.write(`\n▶ Ingesting ${id} ...\n`);
    try {
      const r = await ingest(id);
      console.log(`  fetched=${r.fetched}  added=${r.added}  duplicates=${r.duplicates}`);
    } catch (e) {
      console.error(`  ✗ ${(e as Error).message}`);
    }
  }
  console.log(`\nNext: verify before anything is public →  npx tsx src/cli.ts review list`);
}

function runReview(): void {
  const sub = args[0];
  const store = load();

  if (sub === 'list') {
    const typeFilter = args[1]; // optional: review list job | result | admit_card | ...
    let pending = store.opportunities.filter((o) => o.status === 'needs_review');
    if (pending.length === 0) { console.log('Nothing awaiting review. Run an ingest first.'); return; }

    // Summary by type so the reviewer can focus (open jobs vs results/admit cards/empanelment).
    const counts: Record<string, number> = {};
    for (const o of pending) counts[o.opportunityType] = (counts[o.opportunityType] ?? 0) + 1;
    const summary = Object.entries(counts).map(([t, n]) => `${t}=${n}`).join('  ');
    console.log(`${pending.length} awaiting verification  (${summary})`);

    if (typeFilter) pending = pending.filter((o) => o.opportunityType === typeFilter);
    console.log(`${typeFilter ? `Showing type=${typeFilter}: ${pending.length}` : 'Tip: review list job  →  only open jobs'}\n`);

    for (const o of pending) {
      const conf = Math.round(o.extractionConfidence * 100);
      const flag = o.extractionConfidence < 0.5 ? ' ⚠ verify' : '';
      const dup = o.possibleDuplicate ? ' ⧉ dup?' : '';
      const posts = o.vacancyCount != null ? `${o.vacancyCount} post(s)` : 'posts:?';
      const close = o.closeDate ?? 'close:?';
      console.log(`  ${o.id}  [${o.organizationId}] (${o.opportunityType})  conf ${conf}%${flag}${dup}  ·  ${posts}  ·  ${close}`);
      console.log(`      ${o.title.slice(0, 95)}`);
      console.log(`      ${o.officialUrl}`);
    }
    console.log(`\nApprove:  npx tsx src/cli.ts review approve <id>`);
    return;
  }

  if (sub === 'approve' || sub === 'reject') {
    const id = args[1];
    const o = store.opportunities.find((x) => x.id === id);
    if (!o) { console.error(`Opportunity '${id ?? ''}' not found.`); return; }
    const now = new Date().toISOString();
    if (sub === 'approve') {
      o.status = 'published';
      o.verifiedAt = now;
      o.verifiedBy = 'operator:you';
      o.publishedAt = now;
    } else {
      o.status = 'rejected';
    }
    o.updatedAt = now;
    const task = store.reviewTasks.find((t) => t.opportunityId === id && t.status === 'created');
    if (task) { task.status = sub === 'approve' ? 'approved' : 'rejected'; task.decidedAt = now; }
    save(store);
    console.log(sub === 'approve' ? `✓ Published: ${o.title}` : `✗ Rejected: ${o.title}`);
    return;
  }

  console.log('Usage: review list | review approve <id> | review reject <id>');
}

function runList(): void {
  const store = load();
  const status = args[0];
  const rows = store.opportunities.filter((o) => !status || o.status === status);
  console.log(`${rows.length} opportunit${rows.length === 1 ? 'y' : 'ies'}${status ? ` (status=${status})` : ''}:`);
  for (const o of rows) console.log(`  [${o.status}] (${o.opportunityType}) ${o.title}  (${o.sourceId})`);
}

async function main(): Promise<void> {
  switch (command) {
    case 'import-sources': runImport(); break;
    case 'sources': runSources(); break;
    case 'health': runHealth(); break;
    case 'ingest': await runIngest(); break;
    case 'review': runReview(); break;
    case 'list': runList(); break;
    default: help();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
