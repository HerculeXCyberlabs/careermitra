// JSON-file store backend (the default). A tiny store behind a narrow interface — swap for Postgres
// (store-pg.ts) via CM_STORE=pg without touching the pipeline.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { config } from './config.js';
import type { StoreShape } from './types.js';

const FILE = join(config.dataDir, 'store.json');

function empty(): StoreShape {
  return { sources: [], notifications: [], opportunities: [], reviewTasks: [], health: [] };
}

export function jsonLoad(): StoreShape {
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

export function jsonSave(store: StoreShape): void {
  mkdirSync(config.dataDir, { recursive: true });
  writeFileSync(FILE, JSON.stringify(store, null, 2));
}
