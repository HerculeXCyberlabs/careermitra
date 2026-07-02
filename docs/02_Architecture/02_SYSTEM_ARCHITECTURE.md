# CareerMitra — System Architecture (Logical & Physical)

| | |
|---|---|
| **Version** | 1.0 · **Status** | Approved · **Scope** | Architecture only |
| **Grounded in** | PRD v3.0, DOMAIN_MODEL v1.0, Ubiquitous Language v1.0 |

> The logical and physical shape of the system: modules, runtime planes, and the flows that connect
> them. Realizes the 16 bounded contexts as modules of a cloud-native, event-driven modular monolith.

---

## 1. Logical architecture — context modules
Each bounded context is a **module** with a public contract (commands, queries, events) and a private
model. Modules never reach into each other's data; they integrate via the event backbone and
canonical-id references (Published Language).

```mermaid
flowchart TB
    subgraph SyncPlane[Synchronous request plane]
      GW[API Gateway + BFF]
      subgraph Monolith[Modular Monolith]
        IDN[Identity & Access]
        REF[Reference / Shared Kernel]
        REC[Recruitment]
        CAR[Career & Journey]
        DOC[Documents & Vault]
        AIH[AI - facade]
        SRCH[Search - query side]
        PAYm[Payments]
        SVC[Professional Services]
        CON[Content & SEO]
        ADM[Administration]
        SUP[Support & Trust]
        ANA[Analytics - ingest]
        GRW[Growth]
        NOTF[Notifications & Alerts - facade]
      end
    end
    subgraph AsyncPlane[Asynchronous plane]
      BUS[(Event Backbone)]
      CRWL[Crawler & Ingestion workers]
      AIW[AI & OCR workers]
      ALW[Alert delivery workers]
      IDXW[Indexer workers]
      HISW[History & Analytics workers]
    end
    GW --> Monolith
    Monolith <-->|publish/subscribe| BUS
    CRWL --> BUS
    BUS --> AIW
    BUS --> ALW
    BUS --> IDXW
    BUS --> HISW
    REF -. shared kernel .- REC
    REF -. shared kernel .- CAR
```

### Module dependency rules
- **Allowed:** any module → Reference (shared kernel, read-only canonical ids); any module →
  event backbone (publish/subscribe).
- **Forbidden:** module A reading module B's private store; synchronous cross-context call chains
  that create tight coupling; cross-context database joins.
- **Enforced by:** module-boundary linting/architecture tests in CI (see 03, 10).

## 2. Read vs write separation (CQRS where beneficial)
CQRS is applied **selectively** — only where read and write shapes genuinely diverge.

| Applied (separate read model) | Not applied (single model) |
|---|---|
| Search & Discovery (index) | Payments (transactional consistency wins) |
| Application Tracker, Dashboards | Identity/Consent (simple CRUD) |
| Cutoff/Vacancy/Salary Trends | Reference entities (low volume) |
| Organization/Exam/Skill profiles (SEO) | ServiceRequest state (aggregate) |

- **Why selective:** full CQRS everywhere violates KISS/YAGNI; targeted CQRS gives fast, denormalized
  reads for the heavy paths without eventual-consistency complexity where it isn't needed.
- **Trade-off:** read models are eventually consistent (rebuilt from events); acceptable for search/
  dashboards, unacceptable for money — hence the split above.

## 3. Runtime request lifecycle (synchronous read)
```mermaid
sequenceDiagram
    participant C as Client
    participant E as CDN/WAF
    participant G as API Gateway/BFF
    participant M as Context Module
    participant K as Cache
    participant D as Primary DB / Read Model
    C->>E: request (TLS)
    E->>G: forward (authenticated edge)
    G->>G: authN/Z, rate limit, request-id
    G->>M: routed call
    M->>K: read cache
    alt hit
      K-->>M: cached view
    else miss
      M->>D: query read model
      D-->>M: data
      M->>K: populate cache
    end
    M-->>G: response
    G-->>C: response (+ trace headers)
```

## 4. Event-driven write + propagation
```mermaid
sequenceDiagram
    participant M as Recruitment module
    participant D as Primary DB
    participant O as Outbox
    participant B as Event Backbone
    participant S as Search Indexer
    participant N as Alert workers
    participant H as History workers
    M->>D: persist Opportunity (tx)
    M->>O: write event in same tx (outbox)
    O->>B: relay OpportunityPublished
    B->>S: reindex SearchDocument
    B->>N: fan-out Alerts to trackers
    B->>H: capture history/trends
```
- **Transactional Outbox** guarantees "state change + event" atomicity without distributed
  transactions. *Why:* avoids dual-write inconsistency; *trade-off:* a relay component + at-least-once
  delivery (consumers must be idempotent). *Future:* outbox relay becomes a change-data-capture
  stream when contexts split out.

## 5. Physical architecture (deployment shape)
```mermaid
flowchart TB
    U[Users] --> CDN[CDN + WAF + DDoS]
    CDN --> LB[Regional Load Balancer]
    LB --> ING[Ingress / API Gateway]
    subgraph K8s[Kubernetes cluster - multi-AZ, India region]
      APP[App pods - monolith - autoscaled]
      WKR[Worker pods - crawler/AI/OCR/alerts/indexer]
      MESH[mTLS between pods]
    end
    ING --> APP
    APP --> PG[(Primary DB - HA, replicas)]
    APP --> CACHE[(Cache cluster)]
    APP --> OS[(Search cluster)]
    APP --> VDB[(Vector store)]
    APP --> OBJ[(Object storage)]
    WKR --> BUS[(Event backbone)]
    APP --> BUS
    BUS --> DW[(Analytics lakehouse)]
    subgraph Obs[Observability]
      LOGS[Logs] 
      MET[Metrics]
      TRC[Traces]
    end
    APP --> Obs
    WKR --> Obs
```

## 6. Synchronous vs asynchronous boundaries
| Path | Mode | Why |
|---|---|---|
| User read (search, detail, dashboard) | sync + cache | latency-critical |
| User write (save, apply, profile) | sync persist + async propagate | fast ack, eventual fan-out |
| Ingestion (crawl→publish) | fully async | long-running, bursty, retry-heavy |
| AI (parse, DNA, recommend) | async jobs (sync facade for quick calls) | variable latency, cost control |
| Alerts | async fan-out | surge-heavy, retryable |
| Payments | sync with provider + async reconcile | consistency + webhook settlement |

## 7. External integration & Anti-Corruption Layer
Every external system (government sources, payment provider, AI providers, comms providers) is behind
an **adapter (ACL)** so external contracts and messiness never leak into the domain. *Why:* isolates
change and failure; *future:* adapters swap providers (e.g., add a new SMS vendor) without touching
domain logic.

## 8. Failure & isolation posture
- **Bulkheads:** worker pools per workload (crawler ≠ AI ≠ alerts) so one storm can't starve others.
- **Backpressure:** queues absorb spikes (result day); consumers scale independently.
- **Graceful degradation:** if AI/search degrade, fall back to deterministic structured results and
  "see official source" (grounding rule).
- **Idempotency everywhere** on the async plane (at-least-once delivery).

## 9. Evolution to microservices (seam preview)
Because modules already communicate via events and canonical ids, the physical split is mechanical:
promote a module to its own deployable + datastore, replace in-process events with backbone topics
(already the contract). Full plan in `16_FUTURE_MICROSERVICES.md`.
