// Polite HTTP: single-flight rate limiting, a real User-Agent, and a minimal robots.txt check.
// These government sites are public, but we crawl responsibly (rate-limited, identifiable UA,
// robots-aware) — this is the anti-corruption / legal-governance boundary from the architecture.

import { Agent } from 'undici';
import { config } from './config.js';

let lastRequestAt = 0;

async function politeDelay(): Promise<void> {
  const wait = config.requestDelayMs - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt = Date.now();
}

// Scoped dispatcher (not global): applies timeouts, and — only when explicitly enabled — tolerates
// the incomplete TLS chains common on .gov.in sites. Global TLS verification stays intact.
const dispatcher = new Agent({
  connect: {
    timeout: config.requestTimeoutMs,
    ...(config.allowInsecureTls ? { rejectUnauthorized: false } : {}),
  },
  headersTimeout: config.requestTimeoutMs,
  bodyTimeout: config.requestTimeoutMs,
});

// A fetch that always retries transient network failures (timeout, connection reset) with backoff.
async function resilientFetch(url: string, headers: Record<string, string>): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));
    try {
      // `dispatcher` is an undici extension to fetch options, not in the DOM RequestInit type.
      return await fetch(url, {
        headers,
        redirect: 'follow',
        signal: AbortSignal.timeout(config.requestTimeoutMs),
        dispatcher,
      } as RequestInit);
    } catch (e) {
      lastErr = e;
    }
  }
  const reason = lastErr instanceof Error ? lastErr.message : String(lastErr);
  throw new Error(`fetch failed after ${config.maxRetries + 1} attempt(s): ${reason}`);
}

export async function fetchHtml(url: string): Promise<string> {
  await politeDelay();
  const res = await resilientFetch(url, {
    'user-agent': config.userAgent,
    accept: 'text/html,application/xhtml+xml',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

/** Fetch raw bytes (used for notice PDFs — S027b). Same polite/resilient path as fetchHtml. */
export async function fetchBuffer(url: string): Promise<Buffer> {
  await politeDelay();
  const res = await resilientFetch(url, {
    'user-agent': config.userAgent,
    accept: 'application/pdf,application/octet-stream,*/*',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Minimal robots.txt gate: only blocks if the `User-agent: *` group contains a blanket
 * `Disallow: /`. This is intentionally conservative and simple — for production, use a full
 * robots parser. Returns true (allowed) if robots.txt is missing or unreadable.
 */
export async function robotsAllows(robotsUrl: string): Promise<boolean> {
  if (!config.respectRobots) return true;
  try {
    const res = await resilientFetch(robotsUrl, { 'user-agent': config.userAgent });
    if (!res.ok) return true;
    const lines = (await res.text()).split('\n').map((l) => l.trim().toLowerCase());
    let inStarGroup = false;
    for (const line of lines) {
      if (line.startsWith('user-agent:')) inStarGroup = line.includes('*');
      if (inStarGroup && line === 'disallow: /') return false;
    }
    return true;
  } catch {
    return true;
  }
}
