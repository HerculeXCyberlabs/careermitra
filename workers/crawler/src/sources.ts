// Built-in seed sources (SSC, RRB) so the tool works before you import the CSV registry.
// The full list of ~2000 sources comes from data-intake/source-registry-template.csv via
//   npx tsx src/cli.ts import-sources <file.csv>
// Imported rows override these by matching id.

import type { CanonicalSource } from './types.js';

export const SOURCES: CanonicalSource[] = [
  {
    id: 'ssc',
    name: 'Staff Selection Commission',
    organizationName: 'Staff Selection Commission (SSC)',
    sector: 'central',
    jurisdiction: 'central',
    officialDomain: 'ssc.gov.in',
    listingUrl: 'https://ssc.gov.in/', // verify the real notice-list URL
    robotsUrl: 'https://ssc.gov.in/robots.txt',
    keywords: ['recruit', 'notice', 'notification', 'cgl|chsl|mts|gd|je|steno|cpo|phase'],
    noticeListType: 'javascript_rendered',
  },
  {
    id: 'rrb-cdg',
    name: 'Railway Recruitment Board, Chandigarh',
    organizationName: 'Railway Recruitment Board (RRB)',
    sector: 'railway',
    jurisdiction: 'central',
    officialDomain: 'rrbcdg.gov.in',
    listingUrl: 'https://www.rrbcdg.gov.in/', // verify; RRB is federated across regional boards
    robotsUrl: 'https://www.rrbcdg.gov.in/robots.txt',
    keywords: ['recruit', 'notification|notice', '\\bcen\\b', 'ntpc|group\\s*d|alp|technician'],
    noticeListType: 'unknown',
  },
];
