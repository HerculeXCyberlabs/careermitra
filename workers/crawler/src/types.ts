// Canonical types for the ingestion worker.
// These mirror the designed schema in docs/04_Database (recruitment.opportunities,
// recruitment.notifications_ingested, crawler.sources, admin.review_tasks) so this proof
// maps 1:1 to Postgres later — no schema drift.

// Source ids are free-form strings (kebab-case) so any of the ~2000 sources you supply via the
// CSV registry works without code changes. Examples: 'ssc', 'rrb-cdg', 'upsc', 'ibps', 'uppsc'.
export type SourceId = string;

export type OpportunityStatus = 'needs_review' | 'published' | 'rejected';

// S024 — what kind of notice this is. Only `job` is an open opportunity; the rest belong to the
// Results / Admit Cards / Answer Keys modules (Master PRD §9.4) or are non-jobs (empanelment/tender).
export type OpportunityType =
  | 'job'
  | 'result'
  | 'admit_card'
  | 'answer_key'
  | 'empanelment'
  | 'other';

/** crawler.sources — a registered official source. Most rows come from the CSV registry. */
export interface CanonicalSource {
  id: SourceId;
  name: string;
  organizationName: string; // -> reference.organizations.canonical_name
  sector: string;           // -> recruitment.sector (central|state|psu|railway|banking|defence|...)
  jurisdiction: string;     // central | national | a state name
  officialDomain: string;
  listingUrl: string;       // the page that LISTS notices/notifications (notice_list_url)
  robotsUrl: string;
  keywords?: string[];      // optional per-source title filters (regex source strings)
  noticeListType?: string;  // static_html | javascript_rendered | pdf_list | rss_feed | unknown
  opportunityTypes?: string[];
  priority?: number;
  notes?: string;
}

/** What an adapter extracts from a source page, pre-normalization. */
export interface RawListing {
  sourceId: SourceId;
  title: string;
  detailUrl: string;
  rawText: string;
  fetchedAt: string; // ISO
  checksum: string;
  hints?: { closeDate?: string; examName?: string; vacancyCount?: number; detailText?: string };
}

/** recruitment.notifications_ingested — the immutable provenance anchor. */
export interface RawNotification {
  id: string;
  sourceId: SourceId;
  rawReference: string; // detail URL
  checksum: string;
  extractedText: string;
  fetchedAt: string;
}

/** recruitment.opportunities — the user-facing unit (subset for this proof). */
export interface CanonicalOpportunity {
  id: string;
  notificationId: string;
  sourceId: SourceId;
  organizationName: string;
  organizationId: string;          // S028 — canonical org id (resolved from organizationName)
  title: string;
  opportunityType: OpportunityType;
  sector: string;
  officialUrl: string;
  closeDate: string | null;
  vacancyCount: number | null;     // S027 — extracted number of posts
  noticeYear: number | null;       // most recent year mentioned; used for freshness filtering
  examName: string | null;
  extractionConfidence: number;    // S027 — 0..1; low + high-impact field ⇒ human-verify (§5)
  dedupKey: string;                // S028 — hash of the semantic signature (orgId + title tokens)
  possibleDuplicate: boolean;      // S028 — borderline similarity to an existing item → human check
  possibleDuplicateOf: string | null;
  status: OpportunityStatus;
  // provenance / verification gate (R11)
  verifiedAt: string | null;
  verifiedBy: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** admin.review_tasks — the verification-gate work item. */
export interface ReviewTask {
  id: string;
  opportunityId: string;
  sourceId: SourceId;
  status: 'created' | 'approved' | 'rejected';
  createdAt: string;
  decidedAt: string | null;
  notes: string | null;
}

/** S029 — per-source run outcome, so silent source failure becomes visible (Master PRD §26). */
export interface SourceHealth {
  sourceId: SourceId;
  lastRunAt: string;
  status: 'ok' | 'empty' | 'failed'; // empty = ran fine but 0 candidates (often a config/URL issue)
  fetched: number;
  added: number;
  duplicates: number;
  error: string | null;
  consecutiveFailures: number;
  totalRuns: number;
}

export interface StoreShape {
  sources: CanonicalSource[];
  notifications: RawNotification[];
  opportunities: CanonicalOpportunity[];
  reviewTasks: ReviewTask[];
  health: SourceHealth[];
}
