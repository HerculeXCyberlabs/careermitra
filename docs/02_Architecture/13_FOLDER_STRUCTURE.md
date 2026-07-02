# CareerMitra — Folder Structure (Architecture)

| | |
|---|---|
| **Version** | 1.0 · **Status** | Approved · **Scope** | Structure only — no code |

> The repository layout that encodes the architecture: a **monorepo** whose backend is a **modular
> monolith** with one module per bounded context, each internally **Clean/Hexagonal**. This is a
> structural blueprint (directory trees + rules), not source code.

---

## 1. Why a monorepo + modular monolith layout
- **Why:** one repo gives atomic cross-cutting changes, shared tooling, and enforced module boundaries
  while staying a single deployable; the folder shape *is* the architecture (contexts are visible and
  isolated). **Advantages:** discoverability, consistent conventions, easy refactors, clear seams for
  future extraction. **Trade-offs:** repo grows large; needs boundary enforcement in CI (03/10).
  **Future:** a module folder lifts to its own service/repo with its boundary already intact.

## 2. Top-level layout
```text
careermitra/
├─ apps/
│  ├─ web/                # Next.js aspirant app (SSR/SSG + web BFF)
│  ├─ admin/              # Admin/Reviewer/Support/Trust operator app
│  └─ api/                # Backend composition root (wires modules)
├─ workers/
│  ├─ crawler/            # ingestion fetch/schedule
│  ├─ ocr/                # OCR jobs
│  ├─ ai/                 # AI/ML/OCR orchestration (Python)
│  ├─ indexer/            # search/vector projection builders
│  ├─ alerts/             # Alert delivery workers
│  └─ analytics/          # event → lakehouse
├─ modules/               # bounded-context modules (the monolith core)
│  ├─ identity/
│  ├─ reference/          # shared kernel (canonical entities)
│  ├─ recruitment/
│  ├─ career/
│  ├─ documents/
│  ├─ ai/                 # AI facade + governance
│  ├─ search/
│  ├─ payments/
│  ├─ professional-services/
│  ├─ crawler/
│  ├─ content/
│  ├─ administration/
│  ├─ support-trust/
│  ├─ analytics/
│  ├─ growth/
│  └─ notifications/      # owns Alert entities (not "Notification")
├─ packages/              # shared libraries (no domain logic leakage)
│  ├─ platform-kernel/    # event bus port, outbox, ids, errors, result types
│  ├─ observability/      # OpenTelemetry setup
│  ├─ security/           # authZ policy, consent guard helpers
│  ├─ ui/                 # design system (tokens, Tailwind, components)
│  └─ contracts/          # shared event + API contracts (versioned)
├─ infra/                 # IaC (Terraform), GitOps manifests, environments
│  ├─ terraform/
│  ├─ k8s/
│  └─ environments/       # dev / staging / production
├─ docs/                  # 00_Project, 01_Domain, 02_Architecture, 10_ADR, 11_Runbooks ...
├─ tools/                 # scripts, generators, arch-tests
└─ .env.example           # the only committed env contract
```

## 3. Inside a context module (Clean/Hexagonal)
```text
modules/recruitment/
├─ domain/                # pure business core (no framework/DB)
│  ├─ entities/           # Recruitment, Opportunity, Vacancy, Post, records...
│  ├─ value-objects/      # DateRange, EligibilitySummary, Money...
│  ├─ events/             # OpportunityPublished, ResultAnnounced...
│  ├─ services/           # domain services (invariants, dedup rules)
│  └─ rules/              # verification-gate, provenance invariants
├─ application/           # use cases + ports (interfaces)
│  ├─ commands/           # PublishOpportunity, RecordCutoff...
│  ├─ queries/            # (read side is often in search/read-model modules)
│  └─ ports/              # OpportunityRepository, SearchIndexPort, EventPublisher
├─ adapters/
│  ├─ inbound/            # API handlers, event consumers
│  └─ outbound/           # persistence, search, event backbone, provider ACLs
└─ module.manifest        # public contract: commands, queries, events, deps
```

## 4. Boundary rules (enforced in CI)
| Rule | Enforcement |
|---|---|
| `domain/` imports **nothing** framework/DB | architecture test |
| `adapters/` may import `application/` + `domain/`; not vice-versa | dependency-cruiser-style lint |
| A module may import **`reference`** (shared kernel) and **`packages/contracts`** only | boundary lint |
| No module imports another module's `domain/` or `adapters/` | boundary lint |
| Cross-context communication only via events/contracts | review + lint |
- **Why:** boundaries that aren't enforced rot; CI makes the architecture self-defending.
  **Trade-off:** occasional friction — the point is to make the wrong thing hard.

## 5. Shared packages discipline
`packages/*` hold **mechanism, not domain** (bus, observability, security helpers, UI, contracts).
Domain logic never lives in shared packages (prevents a hidden "god" dependency). `contracts` is the
versioned home of cross-context events and (future) public API schemas.

## 6. Docs & governance layout
```text
docs/
├─ 00_Project/     # PRD, PRD_REVIEW
├─ 01_Domain/      # DOMAIN_MODEL, BUSINESS_GLOSSARY, UBIQUITOUS_LANGUAGE
├─ 02_Architecture/# this set (01–16)
├─ 10_ADR/         # architecture decision records
└─ 11_Runbooks/    # incident/on-call procedures
```

## 7. Future evolution
When a context extracts (16), its `modules/<ctx>/` folder becomes a service repo largely unchanged;
`workers/*` already isolate heavy workloads; `packages/contracts` becomes the shared inter-service
contract. **Why this shape now:** it makes the future split a move, not a rewrite.
