// S028 — entity resolution + semantic dedup helpers.
// (1) Resolve a free-text organization name to a canonical id, so the same body is recognized across
//     different sources (drdo + drdo-rac → 'drdo') — the basis for trends, profiles, and dedup (§7).
// (2) Token-based signatures + Jaccard similarity for *semantic* dedup (not exact-string), so the
//     same recruitment with reworded titles collapses. Match confidence is scored: high-similarity
//     duplicates auto-merge; borderline ones are flagged for human review, never silently dropped.

const ORG_ALIASES: Array<[RegExp, string]> = [
  [/staff selection commission|\bssc\b/, 'ssc'],
  [/union public service commission|\bupsc\b/, 'upsc'],
  [/institute of banking personnel|\bibps\b/, 'ibps'],
  [/reserve bank of india|\brbi\b/, 'rbi'],
  [/defence research.*development|\bdrdo\b|recruitment and assessment/, 'drdo'],
  [/national informatics|\bnic\b/, 'nic'],
  [/computer emergency response|cert-?in/, 'cert-in'],
  [/centre for development of advanced computing|c-?dac/, 'cdac'],
  [/national critical information|nciipc/, 'nciipc'],
  [/national technical research|\bntro\b/, 'ntro'],
  [/railtel/, 'railtel'],
  [/bharat electronics|\bbel\b/, 'bel'],
  [/electronics corporation of india|\becil\b/, 'ecil'],
  [/bharat dynamics|\bbdl\b/, 'bdl'],
  [/hindustan aeronautics|\bhal\b/, 'hal'],
  [/securities and exchange board|\bsebi\b/, 'sebi'],
  [/idrbt|research in banking technology/, 'idrbt'],
  [/nabard|agriculture and rural development/, 'nabard'],
  [/indian army/, 'indian-army'],
  [/indian navy/, 'indian-navy'],
];

/** Free-text org name → canonical id. Falls back to a slug of the normalized name. */
export function resolveOrganizationId(orgName: string): string {
  const norm = orgName.toLowerCase();
  for (const [re, id] of ORG_ALIASES) if (re.test(norm)) return id;
  return (
    norm.replace(/\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) ||
    'unknown'
  );
}

// Noise words that don't identify a specific recruitment — dropped before comparing titles.
const STOP = new Set([
  'detailed', 'notice', 'vacancy', 'vacancies', 'for', 'of', 'the', 'and', 'on', 'at', 'post',
  'posts', 'advertisement', 'advt', 'no', 'nos', 'recruitment', 'engagement', 'walk', 'walkin',
  'interview', 'deputation', 'basis', 'contract', 'level', 'various', 'through', 'click', 'here',
  'download', 'pdf', 'online', 'application', 'apply', 'form', 'regarding', 'date', 'last', 'to', 'in',
]);

export function titleTokens(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/** Order-independent identity of a notice within an organization. */
export function signature(orgId: string, title: string): string {
  const toks = [...new Set(titleTokens(title))].sort();
  return `${orgId}|${toks.join(' ')}`;
}

/** Token-set similarity in [0,1]. */
export function jaccard(a: string[], b: string[]): number {
  const A = new Set(a);
  const B = new Set(b);
  if (A.size === 0 && B.size === 0) return 1;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}
