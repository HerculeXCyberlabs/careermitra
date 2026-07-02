// Shared, defensive link-extraction used by the generic adapter.
// Strategy: parse all anchors, keep only those whose text matches recruitment keywords AND look
// like a real notice (not a nav/section label or a product page), resolve relative URLs, and dedupe.
// Degrades gracefully on layout changes — never throws.

import * as cheerio from 'cheerio';
import { createHash } from 'node:crypto';
import type { CanonicalSource, RawListing } from '../types.js';

// Recruitment-focused defaults (S023). We deliberately do NOT filter by domain terms like
// "cyber"/"security"/"network" here: those match companies' product/service pages (e.g. BEL's
// "Cyber Security Products", RailTel's "Security Operations Center"), not jobs. Whether a notice
// is a *cyber* role is decided later at skill classification (S024), by reading the notice itself.
export const DEFAULT_KEYWORDS: RegExp[] = [
  /recruit/i,
  /vacan/i,
  /advertisement|\badvt\b/i,
  /notification/i,
  /apprentice|internship|fellowship|\bjrf\b|\bsrf\b/i,
  /walk[\s-]?in/i,
  /engagement|empanel/i,
];

// Generic navigation / section labels that match a keyword but are not individual notices.
const NAV_STOPWORDS = new Set([
  'recruitment', 'recruitments', 'careers', 'career', 'vacancy', 'vacancies', 'current vacancies',
  'notifications', 'notification', 'notice', 'notice board', 'apply online', 'read more', 'more',
  'know more about vacancies', 'click here', 'view all', 'archive', 'home', 'recruitment & result',
]);

// Keep a link only if it reads like a real notice: not a bare nav label, and carrying some
// substance — an advt/year/post number, or enough descriptive length to be a genuine posting.
function looksLikeNotice(title: string): boolean {
  const t = title.toLowerCase().replace(/\s+/g, ' ').trim();
  if (NAV_STOPWORDS.has(t)) return false;
  if (t.length < 8) return false;
  return /\d/.test(t) || t.length >= 22;
}

export function extractNoticeLinks(
  html: string,
  source: CanonicalSource,
  keywords: RegExp[],
): RawListing[] {
  const $ = cheerio.load(html);
  const out: RawListing[] = [];
  const seen = new Set<string>();

  $('a').each((_, el) => {
    const a = $(el);
    const title = a.text().trim().replace(/\s+/g, ' ');
    const href = a.attr('href');
    if (!title || !href || title.length < 8) return;
    if (!keywords.some((re) => re.test(title))) return;
    if (!looksLikeNotice(title)) return; // S023: reject nav/section labels & product pages

    let detailUrl: string;
    try {
      detailUrl = new URL(href, source.listingUrl).toString();
    } catch {
      return; // skip javascript:, mailto:, malformed hrefs
    }
    if (seen.has(detailUrl)) return;
    seen.add(detailUrl);

    out.push({
      sourceId: source.id,
      title,
      detailUrl,
      rawText: title,
      fetchedAt: new Date().toISOString(),
      checksum: createHash('sha256').update(`${detailUrl}|${title}`).digest('hex'),
    });
  });

  return out;
}
