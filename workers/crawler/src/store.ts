// Store facade — selects the backend by config.store ('json' default, or 'pg' for Postgres, S030).
// load()/save() are async so a real database backend fits the same contract; the JSON backend just
// returns its synchronous result. store-pg is imported lazily so JSON mode never loads the pg driver.

import { config } from './config.js';
import { jsonLoad, jsonSave } from './store-json.js';
import type { StoreShape } from './types.js';

export async function load(): Promise<StoreShape> {
  if (config.store === 'pg') {
    const { pgLoad } = await import('./store-pg.js');
    return pgLoad();
  }
  return jsonLoad();
}

export async function save(store: StoreShape): Promise<void> {
  if (config.store === 'pg') {
    const { pgSave } = await import('./store-pg.js');
    return pgSave(store);
  }
  jsonSave(store);
}

/** Release DB resources so the process can exit cleanly (no-op for the JSON backend). */
export async function closeStore(): Promise<void> {
  if (config.store === 'pg') {
    const { pgClose } = await import('./store-pg.js');
    await pgClose();
  }
}
