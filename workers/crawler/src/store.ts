// A tiny JSON-file store behind a narrow interface (ports & adapters, matching the architecture).
// Zero native dependencies → runs anywhere with just `npm install`. Swap this file for a
// Postgres implementation later without touching the pipeline (same load()/save() contract).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { config } from './config.js';
import type { StoreShape } from './types.js';

const FILE = join(config.dataDir, 'store.json');

function empty(): StoreShape {
  return { sources: [], notifications: [], opportunities: [], reviewTasks: [], health: [] };
}

export function load(): StoreShape {
  if (!existsSync(FILE)) return empty();
  try {
    const p = JSON.parse(readFileSync(FILE, 'utf8')) as Partial<StoreShape>;
    // Backfill any missing collections so older stores keep working.
    return {
      sources: p.sources ?? [],
      notifications: p.notifications ?? [],
      opportunities: p.opportunities ?? [],
      reviewTasks: p.reviewTasks ?? [],
      health: p.health ?? [],
    };
  } catch {
    return empty();
  }
}

export function save(store: StoreShape): void {
  mkdirSync(config.dataDir, { recursive: true });
  writeFileSync(FILE, JSON.stringify(store, null, 2));
}
