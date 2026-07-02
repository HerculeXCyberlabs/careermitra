// Generic, config-driven adapter — works for ANY source using its notice_list_url + keywords.
// This is what lets ~2000 sources run without per-source code: each source is just a data row.
// (For JavaScript-rendered pages, a Playwright-backed fetch can be slotted in behind fetchHtml.)

import { fetchHtml, robotsAllows } from '../http.js';
import { extractNoticeLinks, DEFAULT_KEYWORDS } from './extract.js';
import type { CanonicalSource, RawListing } from '../types.js';

export async function fetchListings(source: CanonicalSource): Promise<RawListing[]> {
  if (!(await robotsAllows(source.robotsUrl))) {
    console.warn(`[${source.id}] robots.txt disallows crawling ${source.officialDomain}; skipping.`);
    return [];
  }

  const html = await fetchHtml(source.listingUrl);
  const keywords =
    source.keywords && source.keywords.length > 0
      ? source.keywords.map((k) => new RegExp(k, 'i'))
      : DEFAULT_KEYWORDS;

  const listings = extractNoticeLinks(html, source, keywords);
  if (listings.length === 0) {
    console.warn(
      `[${source.id}] 0 candidates — verify notice_list_url and keywords for this source ` +
        `(the list may be on a sub-page or JavaScript-rendered).`,
    );
  }
  return listings;
}
