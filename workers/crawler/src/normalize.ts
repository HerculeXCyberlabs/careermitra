// Normalization: turn a raw scraped listing into the canonical model with provenance.
// Output opportunities always start as `needs_review` — nothing is user-visible until you
// approve it (the verification gate, R11). Every opportunity carries its source + notification
// (provenance) and a dedupKey so the same recruitment is not stored twice.

import { createHash, randomUUID } from 'node:crypto';
import { classifyType } from './classify.js';
import { extractFields } from './extract-fields.js';
import { resolveOrganizationId, signature } from './resolve.js';
import type {
  CanonicalOpportunity,
  CanonicalSource,
  RawListing,
  RawNotification,
} from './types.js';

// S028 — dedupKey is now a hash of the *semantic signature* (canonical org + sorted title tokens),
// so the same recruitment collapses even across sources or with reordered/reworded titles.
function dedupKey(orgId: string, title: string): string {
  return createHash('sha256').update(signature(orgId, title)).digest('hex').slice(0, 16);
}

export function normalize(
  source: CanonicalSource,
  raw: RawListing,
): { notification: RawNotification; opportunity: CanonicalOpportunity } {
  const now = new Date().toISOString();
  const ex = extractFields(raw.title, raw.hints?.detailText);
  const organizationId = resolveOrganizationId(source.organizationName);

  const notification: RawNotification = {
    id: `ntf_${randomUUID()}`,
    sourceId: source.id,
    rawReference: raw.detailUrl,
    checksum: raw.checksum,
    extractedText: raw.rawText,
    fetchedAt: raw.fetchedAt,
  };

  const opportunity: CanonicalOpportunity = {
    id: `opp_${randomUUID()}`,
    notificationId: notification.id,
    sourceId: source.id,
    organizationName: source.organizationName,
    organizationId,
    title: raw.title,
    opportunityType: classifyType(raw.title),
    sector: source.sector,
    officialUrl: raw.detailUrl,
    closeDate: ex.closeDate ?? raw.hints?.closeDate ?? null,
    vacancyCount: ex.vacancyCount ?? raw.hints?.vacancyCount ?? null,
    noticeYear: ex.noticeYear,
    examName: raw.hints?.examName ?? null,
    extractionConfidence: ex.confidence,
    dedupKey: dedupKey(organizationId, raw.title),
    possibleDuplicate: false,
    possibleDuplicateOf: null,
    status: 'needs_review',
    verifiedAt: null,
    verifiedBy: null,
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  return { notification, opportunity };
}
