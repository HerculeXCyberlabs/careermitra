// Runtime config from environment (see .env.example). No secrets here (R14).

export const config = {
  userAgent:
    process.env.CRAWLER_USER_AGENT ??
    'CareerMitraBot/0.1 (+https://careermitra.in/bot; contact@careermitra.in)',
  requestDelayMs: Number(process.env.CRAWLER_REQUEST_DELAY_MS ?? 3000),
  respectRobots: (process.env.CRAWLER_RESPECT_ROBOTS ?? 'true') !== 'false',
  dataDir: process.env.CM_DATA_DIR ?? './data',

  // S021 — resilient fetch. Government sites are slow and often ship broken TLS chains.
  requestTimeoutMs: Number(process.env.CRAWLER_REQUEST_TIMEOUT_MS ?? 20000),
  maxRetries: Number(process.env.CRAWLER_MAX_RETRIES ?? 2),
  // Many .gov.in sites serve an incomplete certificate chain (UNABLE_TO_VERIFY_LEAF_SIGNATURE).
  // We only READ public HTML and send no credentials, so relaxing chain verification for these
  // public sources is acceptable — but it is OFF by default and must be enabled explicitly.
  allowInsecureTls: (process.env.CRAWLER_ALLOW_INSECURE_TLS ?? 'false') === 'true',

  // S027 — when true, the pipeline also fetches each notice's detail page (HTML only, not PDFs) to
  // extract close date / vacancies. Off by default because it costs one polite request per notice.
  fetchDetails: (process.env.CRAWLER_FETCH_DETAILS ?? 'false') === 'true',
};
