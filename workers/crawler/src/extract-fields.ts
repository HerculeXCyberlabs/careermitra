// S027 — high-impact field extraction from a notice's title and (optionally) its detail page.
// Extracts vacancy count and application close date, then scores extraction confidence. That
// confidence feeds the human-review gate (Data Engine PRD §5): a low-confidence high-impact field
// (a date/vacancy we couldn't read well) must be human-verified before publish. Title-based by
// default (cheap, no extra requests); detail-page text refines it when the pipeline fetches it.

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

/** "01 Post", "3 Posts", "10 vacancies", "No. of posts: 25". Ignores years (no post keyword). */
export function extractVacancyCount(text: string): number | null {
  const m =
    text.match(/\b(\d{1,4})\s*(?:nos?\.?\s*)?(?:posts?|vacanc(?:y|ies)|positions?|seats?)\b/i) ??
    text.match(/\b(?:posts?|vacanc(?:y|ies))\s*[:\-]?\s*(\d{1,4})\b/i);
  const raw = m?.[1];
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 && n < 100000 ? n : null;
}

function toIsoNumeric(dmy: string): string | null {
  const m = dmy.match(/([0-3]?\d)[/.\-]([01]?\d)[/.\-]((?:20)?\d\d)/);
  if (!m) return null;
  const dd = m[1]!.padStart(2, '0');
  const mm = m[2]!.padStart(2, '0');
  const yr = m[3]!.length === 2 ? '20' + m[3]! : m[3]!;
  if (+mm < 1 || +mm > 12 || +dd < 1 || +dd > 31) return null;
  return `${yr}-${mm}-${dd}`;
}

/** Only returns a date found *near* a closing keyword — never guesses a random date on the page. */
export function extractCloseDate(text: string): string | null {
  const numeric = text.match(
    /(?:last date|closing date|apply\s*by|last day|closing on|up\s?to)[^0-9]{0,20}([0-3]?\d[/.\-][01]?\d[/.\-](?:20)?\d\d)/i,
  );
  if (numeric?.[1]) {
    const iso = toIsoNumeric(numeric[1]);
    if (iso) return iso;
  }
  const textual = text.match(
    /(?:last date|closing date|apply\s*by|last day)[^0-9]{0,20}([0-3]?\d)\s*(?:st|nd|rd|th)?\s*([A-Za-z]{3,9})\.?,?\s*((?:20)?\d\d)/i,
  );
  if (textual) {
    const mo = MONTHS[textual[2]!.slice(0, 3).toLowerCase()];
    if (mo) {
      const yr = textual[3]!.length === 2 ? '20' + textual[3]! : textual[3]!;
      return `${yr}-${String(mo).padStart(2, '0')}-${textual[1]!.padStart(2, '0')}`;
    }
  }

  // Compact fallback for de-spaced PDF text ("lastdate15.09.2026" after glyph collapsing).
  const compact = text.replace(/\s+/g, '').toLowerCase();
  const cm = compact.match(
    /(?:lastdate|closingdate|applyby|lastday|closingon)[^\d]{0,6}([0-3]?\d[/.\-][01]?\d[/.\-](?:20)?\d\d)/,
  );
  if (cm?.[1]) return toIsoNumeric(cm[1]);
  return null;
}

// The most recent 4-digit year mentioned (2000–2099), used to filter out stale/archived notices.
// Returns null when no year is present — the caller treats "unknown" as "possibly current".
export function extractNoticeYear(text: string): number | null {
  const years = [...text.matchAll(/\b(?:19|20)\d{2}\b/g)]
    .map((m) => Number(m[0]))
    .filter((y) => y >= 2000 && y <= 2099);
  return years.length ? Math.max(...years) : null;
}

export interface Extracted {
  closeDate: string | null;
  vacancyCount: number | null;
  noticeYear: number | null;
  confidence: number; // 0..1 — how much high-impact data we captured
  source: 'title' | 'detail' | 'none';
}

export function extractFields(title: string, detailText?: string): Extracted {
  const text = detailText ? `${title}\n${detailText}` : title;
  const vacancyCount = extractVacancyCount(text);
  const closeDate = extractCloseDate(text);
  const noticeYear = extractNoticeYear(text);
  let confidence = 0.2; // baseline: we at least have a classified, provenance-linked notice
  if (vacancyCount !== null) confidence += 0.4;
  if (closeDate !== null) confidence += 0.4;
  const source: Extracted['source'] = detailText
    ? 'detail'
    : vacancyCount !== null || closeDate !== null
      ? 'title'
      : 'none';
  return { closeDate, vacancyCount, noticeYear, confidence: Math.min(1, confidence), source };
}
