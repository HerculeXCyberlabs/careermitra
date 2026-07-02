# CareerMitra — Architecture Decision Records (ADRs)

| | |
|---|---|
| **Version** | 1.0 · **Status** | Approved · **Scope** | Architecture only |
| **Note** | This is the architecture-level ADR summary. Ongoing/implementation ADRs live in `docs/10_ADR`. |

> Each record: **Context · Decision · Status · Consequences (advantages + trade-offs) · Alternatives ·
> Future**. These capture *why* the architecture is the way it is, so future engineers change it
> knowingly, not accidentally.

---

### ADR-0001 — Modular Monolith first, microservice-ready
- **Context:** small team, pre-scale, 16 bounded contexts, need speed + clean boundaries.
- **Decision:** build a modular monolith (one module per context, enforced boundaries), designed for
  later extraction.
- **Consequences:** + fast MVP, one deploy, atomic refactors, low ops cost; − single scaling/deploy
  unit, boundary discipline required (CI-enforced).
- **Alternatives:** microservices now (rejected: premature complexity/cost); big-ball-of-mud monolith
  (rejected: unmaintainable).
- **Future:** extract contexts along seams (16).

### ADR-0002 — Event-driven integration (durable log + transactional outbox)
- **Context:** contexts must integrate without shared tables; future services need the same contract.
- **Decision:** integrate via domain events on a durable, replayable log; use the transactional outbox
  for atomic state+event.
- **Consequences:** + decoupling, replayable read models, CDC-ready; − eventual consistency, idempotent
  consumers required, relay component.
- **Alternatives:** synchronous cross-context calls (rejected: tight coupling); shared DB (rejected:
  breaks boundaries).
- **Future:** the inter-service contract post-extraction.

### ADR-0003 — PostgreSQL as primary datastore
- **Context:** money/identity/recruitment need ACID + integrity; want minimal systems early.
- **Decision:** PostgreSQL primary; pgvector for early semantic needs.
- **Consequences:** + reliability, integrity, one datastore; − not a search/large-vector engine
  (offloaded).
- **Alternatives:** NoSQL-first (rejected: weakens integrity for transactional data).
- **Future:** replicas → per-context DBs → partitioning when measured.

### ADR-0004 — OpenSearch for the search read model
- **Context:** government search needs full-text, facets, ranking at scale.
- **Decision:** OpenSearch as a CQRS read model rebuilt from events.
- **Consequences:** + powerful search, horizontal scale; − eventual consistency, ops overhead.
- **Alternatives:** DB full-text (rejected: insufficient at scale).
- **Future:** dedicated search service, regional indices.

### ADR-0005 — pgvector first, dedicated vector DB later
- **Context:** semantic search/dedup/matching need vectors; avoid extra systems at MVP.
- **Decision:** start with pgvector; migrate to a dedicated vector DB at scale.
- **Consequences:** + fewer systems early, clean upgrade path; − pgvector limits at very large scale.
- **Alternatives:** dedicated vector DB from day one (rejected: premature ops cost).
- **Future:** sharded dedicated vector store.

### ADR-0006 — CQRS applied selectively
- **Context:** read/write shapes diverge on hot paths (search, tracker, trends) but not on money/CRUD.
- **Decision:** separate read models only where beneficial; single model elsewhere.
- **Consequences:** + fast denormalized reads where needed; − two models to maintain on those paths.
- **Alternatives:** CQRS everywhere (rejected: YAGNI/complexity); nowhere (rejected: slow reads at scale).
- **Future:** more read models as new heavy queries appear.

### ADR-0007 — Polyglot: TypeScript/NestJS core + Python AI workers
- **Context:** shared language with frontend speeds delivery; AI ecosystem is Python.
- **Decision:** TS/NestJS monolith; Python for AI/ML/OCR workers behind the AI gateway.
- **Consequences:** + fast build, best AI tooling; − two languages, a service boundary for AI.
- **Alternatives:** single language everywhere (rejected: weak AI ecosystem or slow web).
- **Future:** hot contexts may adopt Go/Rust on extraction.

### ADR-0008 — Next.js for web (SSR/SSG)
- **Context:** SEO/entity pages are the primary acquisition channel.
- **Decision:** Next.js (React/TS) for SSR/SSG + web BFF; reuse the design system.
- **Consequences:** + SEO, fast mobile paint, one language; − SSR infra/caching to run.
- **Alternatives:** SPA-only (rejected: poor SEO).
- **Future:** native mobile reuses APIs + design system.

### ADR-0009 — Kubernetes + Terraform + GitOps
- **Context:** need portable, self-healing, reproducible infra for a decade.
- **Decision:** Kubernetes, IaC (Terraform), GitOps.
- **Consequences:** + portability, autoscaling, audited change; − operational complexity.
- **Alternatives:** PaaS-only (rejected: less control at scale); VMs (rejected: manual ops).
- **Future:** hosts extracted services unchanged.

### ADR-0010 — OAuth2/OIDC + JWT, RBAC+ABAC, Zero Trust
- **Context:** citizen PII at scale; fine-grained, contextual access (executive scope, consent).
- **Decision:** OIDC + short-lived JWT + MFA/step-up; RBAC for roles, ABAC for context rules; mTLS
  internal.
- **Consequences:** + strong, standard, revocable security; − policy/token complexity.
- **Alternatives:** RBAC-only (rejected: too coarse); session cookies only (rejected: less flexible).
- **Future:** gov-SSO identity.

### ADR-0011 — India single-region multi-AZ first; DR region; multi-region later
- **Context:** DPDP residency; cost; resilience.
- **Decision:** start single India region multi-AZ, add warm DR region, then multi-region when needed.
- **Consequences:** + residency + resilience at sane cost; − no cross-region latency benefit initially.
- **Alternatives:** multi-region now (rejected: premature cost/complexity).
- **Future:** active-active multi-region.

### ADR-0012 — Payments via external PCI provider (no card data stored)
- **Context:** minimize PCI scope and risk.
- **Decision:** hosted checkout/tokenization; store only tokens + Order/Payment/Invoice/Refund + GST.
- **Consequences:** + minimal PCI scope, lower risk; − provider dependency (abstracted via ACL).
- **Alternatives:** store card data (rejected: massive risk/scope).
- **Future:** UPI/wallets, more providers, B2B invoicing.

### ADR-0013 — Grounded AI with a mandatory governance gate
- **Context:** AI-first product; trust is the brand; hallucination is unacceptable for eligibility.
- **Decision:** RAG/grounding over verified data + governance spine (registry, evals, guardrails,
  budgets); deterministic engines for correctness-critical logic (eligibility, matching).
- **Consequences:** + trust, safety, cost control; − retrieval latency/cost, eval effort.
- **Alternatives:** ungrounded LLM features (rejected: unsafe/untrustworthy).
- **Future:** self-hosted models, more capabilities under the same gate.

### ADR-0014 — Naming: Notification = official announcement; Alert = outbound message
- **Context:** the word "notification" collided across contexts (see `UBIQUITOUS_LANGUAGE.md` §4.1).
- **Decision:** reserve **Notification** for the official announcement; outbound messages are
  **Alert** (`Alert/AlertTemplate/AlertPreference/AlertSubscription`, events `AlertSent/Delivered`).
- **Consequences:** + one concept per word, no ambiguity; − a UI label ("Notifications" bell) differs
  from the domain term (documented).
- **Alternatives:** context-scoped "Notification" for both (rejected: team confusion).
- **Future:** stable across the platform.

### ADR-0015 — Crawler extracted first among microservices
- **Context:** ingestion has distinct scaling (bursty, 100k sources), fault-isolation, and cost.
- **Decision:** make Crawler the first extraction candidate.
- **Consequences:** + isolates the noisiest workload early; − first cross-service operational lift.
- **Alternatives:** extract AI or Search first (viable; sequenced after — see 16).
- **Future:** AI, Search, Notifications, Payments follow.

### ADR-0016 — Deterministic Eligibility Engine (not an LLM)
- **Context:** eligibility must be correct, explainable, auditable; wrong eligibility is a legal/trust
  failure.
- **Decision:** implement eligibility as deterministic rules (age/qualification/category relaxations);
  AI only explains, never decides.
- **Consequences:** + correctness, explainability, auditability; − rule maintenance effort.
- **Alternatives:** LLM-decided eligibility (rejected: hallucination risk).
- **Future:** structured, machine-evaluable rule sets per Opportunity.

---

## ADR index
| ID | Title | Status |
|---|---|---|
| 0001 | Modular Monolith first | Accepted |
| 0002 | Event-driven + outbox | Accepted |
| 0003 | PostgreSQL primary | Accepted |
| 0004 | OpenSearch read model | Accepted |
| 0005 | pgvector → dedicated vectors | Accepted |
| 0006 | Selective CQRS | Accepted |
| 0007 | Polyglot TS + Python | Accepted |
| 0008 | Next.js SSR/SSG | Accepted |
| 0009 | Kubernetes + IaC + GitOps | Accepted |
| 0010 | OIDC/JWT + RBAC/ABAC + Zero Trust | Accepted |
| 0011 | India region → DR → multi-region | Accepted |
| 0012 | External PCI payments | Accepted |
| 0013 | Grounded AI + governance gate | Accepted |
| 0014 | Notification/Alert naming | Accepted |
| 0015 | Crawler extracted first | Accepted |
| 0016 | Deterministic eligibility | Accepted |
