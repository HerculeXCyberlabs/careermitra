// Import the filled Source Registry CSV (data-intake/source-registry-template.csv) into the store.
// Includes a small, dependency-free CSV parser (handles quoted fields, commas, CRLF).

import { readFileSync } from 'node:fs';
import { load, save } from './store.js';
import type { CanonicalSource } from './types.js';

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function splitList(v: string): string[] | undefined {
  const parts = v.split('|').map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : undefined;
}

export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: string[];
}

const REQUIRED = ['source_id', 'name', 'sector', 'official_domain', 'notice_list_url'];

export function importSources(file: string): ImportResult {
  const rows = parseCsv(readFileSync(file, 'utf8')).filter((r) => r.some((c) => c.trim() !== ''));
  if (rows.length < 2) throw new Error('CSV has a header but no data rows.');

  const header = rows[0]!.map((h) => h.trim().toLowerCase());
  for (const col of REQUIRED) {
    if (!header.includes(col)) throw new Error(`Missing required column: "${col}"`);
  }
  const at = (name: string) => header.indexOf(name);

  const store = load();
  const byId = new Map<string, CanonicalSource>(store.sources.map((s) => [s.id, s]));
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;

  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r]!;
    const get = (name: string) => (at(name) >= 0 ? (cols[at(name)] ?? '').trim() : '');

    const id = get('source_id');
    const name = get('name');
    const sector = get('sector');
    const domain = get('official_domain').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const listingUrl = get('notice_list_url');

    if (!id) { skipped++; continue; }
    if (!name || !sector || !domain || !listingUrl) {
      errors.push(`Row ${r + 1} (${id}): missing a required field`);
      skipped++;
      continue;
    }

    byId.set(id, {
      id,
      name,
      organizationName: get('organization_name') || name,
      sector,
      jurisdiction: get('jurisdiction') || get('state') || sector,
      officialDomain: domain,
      listingUrl,
      robotsUrl: get('robots_url') || `https://${domain}/robots.txt`,
      keywords: splitList(get('keywords')),
      noticeListType: get('notice_list_type') || undefined,
      opportunityTypes: splitList(get('opportunity_types')),
      priority: get('priority') ? Number(get('priority')) : undefined,
      notes: get('notes') || undefined,
    });
    imported++;
  }

  store.sources = [...byId.values()];
  save(store);
  return { total: rows.length - 1, imported, skipped, errors };
}
