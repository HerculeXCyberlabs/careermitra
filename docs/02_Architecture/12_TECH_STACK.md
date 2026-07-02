# CareerMitra — Technology Stack

| | |
|---|---|
| **Version** | 1.0 · **Status** | Approved (final tool selections confirmed per ADR, `docs/10_ADR`) · **Scope** | Architecture only |

> Concrete technology choices per layer, each with **Why / Advantages / Trade-offs / Future
> evolution**. Choices favor **open standards and provider portability**, align with the existing
> design system (React/Tailwind) and conventions (`PROJECT_RULES.md`), and support the Modular
> Monolith → Microservice path. Representative tools are named; final vendor selection is ADR-gated.

---

## 1. Stack at a glance
| Layer | Choice | Category |
|---|---|---|
| Web (aspirant + admin) | **Next.js (React, TypeScript)** | SSR/SSG for SEO + BFF |
| Core backend (modular monolith) | **TypeScript on Node (NestJS)** | DI + modules = bounded contexts |
| AI / ML / OCR workers | **Python** (alongside TS orchestration) | ML/AI ecosystem |
| Primary database | **PostgreSQL** | transactional write models |
| Search | **OpenSearch** | full-text + facets + ranking |
| Vectors | **pgvector → dedicated vector DB at scale** | embeddings / semantic |
| Cache | **Redis** | hot reads, sessions, counters |
| Event backbone | **Kafka-compatible** (managed / Redpanda) | events + work log |
| Object storage | **S3-compatible** | documents, crawl artefacts, proofs |
| Analytics | **Lakehouse** (columnar warehouse/engine) | events, trends, reporting |
| Orchestration | **Kubernetes + containers** | cloud-native compute |
| IaC / GitOps | **Terraform + Argo CD-style GitOps** | reproducible infra |
| Observability | **OpenTelemetry + Prometheus/Grafana + centralized logs** | metrics/traces/logs |
| Identity | **OAuth2/OIDC + JWT** (managed IdP or Keycloak) | auth |
| Secrets | **Managed secrets manager / Vault (KMS-backed)** | secrets/keys |

## 2. Frontend — Next.js (React, TypeScript)
- **Why:** SEO is the #1 acquisition channel (PRD §31); server-rendered/statically-generated entity
  pages need SSR/SSG, which Next.js provides; reuses the existing React/Tailwind design system;
  doubles as the web BFF. **Advantages:** SEO, fast first paint on mobile, one language with backend,
  large ecosystem, incremental static regeneration for freshness. **Trade-offs:** SSR infra to run
  and cache; hydration cost — mitigated by caching/CDN. **Future:** React Native/native mobile apps
  reuse the design system and the same APIs/BFF.

## 3. Core backend — TypeScript / NestJS (modular monolith)
- **Why:** NestJS modules map cleanly to bounded contexts with enforced boundaries and DI (supports
  Clean/Hexagonal); shared TS with frontend speeds delivery; strong for API-first. **Advantages:**
  fast MVP, one language, testable, good tooling, straightforward path to extract modules to services.
  **Trade-offs:** Node is less ideal for CPU-bound work (offloaded to Python/workers); discipline
  needed to keep module boundaries. **Future:** hot/heavy contexts (Crawler, AI, Search) may be
  re-implemented in Go/Python/Rust when extracted for performance (16).

## 4. AI / ML / OCR — Python workers
- **Why:** the AI/ML/OCR ecosystem (embeddings, parsing, OCR, evals) is richest in Python; keeps AI
  logic where the libraries are. **Advantages:** best-in-class ML tooling, fast iteration on models/
  evals. **Trade-offs:** a second language + service boundary — bounded to the AI/OCR workers behind
  the `AIGatewayPort`. **Future:** selective self-hosted models; the AI context extracts early (16).

## 5. PostgreSQL (primary DB)
- **Why:** ACID, relational integrity for money/identity/recruitment, JSON for flexible fields,
  mature HA/replication/PITR, and **pgvector** to start semantic search without a new system.
  **Advantages:** reliability, one well-understood datastore, strong ecosystem. **Trade-offs:** not a
  search or large-scale vector engine → those are offloaded (OpenSearch, dedicated vector DB later).
  **Future:** read replicas → per-context databases on extraction → partitioning/sharding when measured.

## 6. OpenSearch (search)
- **Why:** proven full-text, faceting, and ranking at scale; open, portable. **Advantages:** rich
  query DSL, aggregations, horizontal scale. **Trade-offs:** eventually consistent, ops overhead —
  it's a **read model** rebuildable from events (05/06). **Future:** dedicated search service +
  regional indices.

## 7. Vectors — pgvector → dedicated store
- **Why (KISS first):** start with **pgvector** to avoid running a separate system at MVP scale; move
  to a dedicated vector DB (e.g., Qdrant/Milvus-class) when corpus/latency demands. **Advantages:**
  fewer moving parts early; clean upgrade path. **Trade-offs:** pgvector limits at very large scale —
  planned migration. **Future:** sharded dedicated vector store powering search/dedup/matching (07).

## 8. Redis (cache) · Kafka-compatible (events) · S3-compatible (objects)
- **Redis — Why:** fast hot-read cache, sessions, rate-limit counters. **Trade-off:** volatile →
  rebuildable. **Future:** partition per workload.
- **Event backbone — Why:** a durable, partitioned, **replayable log** enables CQRS read-model
  rebuilds, history capture, and CDC to future services. **Trade-off:** heavier than a simple queue —
  justified by the event-driven core. **Future:** the integration contract for extracted services.
- **Object storage — Why:** cheap, durable, tiered storage for documents/crawl/proofs; encrypted.
  **Trade-off:** eventual-consistency semantics — handled in adapters. **Future:** lifecycle to cold
  tiers.

## 9. Kubernetes + Terraform + GitOps
- **Why:** portable, self-healing, standard autoscaling/rollout; IaC + GitOps give reproducibility and
  audited change (04/10). **Advantages:** cloud-portability, one platform for monolith and future
  services. **Trade-offs:** operational complexity — mitigated by managed control plane and platform
  tooling. **Future:** hosts extracted microservices without re-platforming.

## 10. Observability — OpenTelemetry
- **Why:** vendor-neutral traces/metrics/logs across the sync + async planes; avoids lock-in.
  **Advantages:** end-to-end tracing including ingestion/AI/alerts; portable backends. **Trade-offs:**
  instrumentation effort + telemetry cost — sampled/tiered. **Future:** richer SLO automation.

## 11. Identity & secrets
- **OAuth2/OIDC + JWT** (managed IdP or self-hosted Keycloak-class) — standards-based, revocable,
  supports future gov-SSO. **Secrets:** managed manager/Vault, KMS-backed, rotated. **Trade-offs:**
  IdP dependency/complexity — centralized at the gateway. **Future:** DigiLocker-style identity.

## 12. Cross-cutting conventions (from PROJECT_RULES.md)
TypeScript strict; kebab-case source files; PascalCase React components; SCREAMING_SNAKE env vars;
Conventional Commits; SemVer; ADRs for architectural choices. The design system (tokens, Tailwind,
Plus Jakarta Sans/Inter/Noto Devanagari) is the UI foundation.

## 13. Portability & exit strategy
Every choice has an open standard or portable equivalent (Kubernetes, PostgreSQL, OpenSearch, S3 API,
Kafka API, OpenTelemetry, OIDC). **Why:** avoids deep vendor lock-in for a decade-long product;
**trade-off:** occasionally foregoing a proprietary convenience — accepted for long-term optionality.
