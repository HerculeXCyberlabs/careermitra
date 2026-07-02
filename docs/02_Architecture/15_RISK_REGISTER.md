# CareerMitra — Architecture Risk Register

| | |
|---|---|
| **Version** | 1.0 · **Status** | Living document · **Scope** | Architecture/technical risks |
| **Complements** | PRD §41 (product risks). This register focuses on **architecture, technical, scale, security, cost, vendor, and operational** risks. |

> Each risk: **impact · likelihood · mitigation (architectural) · early-warning signal · owner**.
> Scored to guide where architecture investment is most urgent.

---

## 1. Risk matrix (summary)
| # | Risk | Impact | Likelihood | Priority |
|---|---|---|---|---|
| AR-1 | Entity resolution / dedup fails at scale | Critical | High | P0 |
| AR-2 | Module boundaries erode (monolith → mud) | High | High | P0 |
| AR-3 | Ingestion overwhelmed by 100k sources | High | High | P0 |
| AR-4 | AI hallucination / grounding failure | Critical | Medium | P0 |
| AR-5 | Sensitive-PII exposure / breach | Critical | Low | P0 |
| AR-6 | Result-day surge outage | High | Medium | P1 |
| AR-7 | AI/infra cost outruns revenue | High | Medium | P1 |
| AR-8 | Event backbone as single point of failure | High | Low | P1 |
| AR-9 | Search relevance/quality degrades | Medium | Medium | P1 |
| AR-10 | Vendor lock-in constrains options | Medium | Medium | P2 |
| AR-11 | Eventual-consistency bugs (stale reads) | Medium | Medium | P2 |
| AR-12 | Fraud/scam listings reach users | Critical | High | P0 |
| AR-13 | DR/backup unproven when needed | High | Low | P1 |
| AR-14 | Compliance (DPDP/consent) gap | High | Medium | P1 |
| AR-15 | Migration debt (pgvector, sharding) deferred too long | Medium | Medium | P2 |

## 2. Detail

**AR-1 — Entity resolution / dedup fails at scale.** *Impact:* duplicate/wrong Opportunities destroy
trust. *Mitigation:* deterministic keys + fuzzy + embeddings, confidence scoring, human backstop
(05 §4, 08); measure dedup precision/recall as SLOs. *Signal:* duplicate-rate metric rising, review
queue backlog. *Owner:* Data/AI architect.

**AR-2 — Module boundaries erode.** *Impact:* the future microservice path closes; velocity collapses.
*Mitigation:* CI architecture tests + boundary linting (03/13); reviews reject cross-context reads.
*Signal:* boundary-violation lint hits; growing cross-module imports. *Owner:* Principal architect.

**AR-3 — Ingestion overwhelmed.** *Impact:* stale data, missed recruitments. *Mitigation:* adaptive
scheduling, per-domain rate limits, queue backpressure, autoscaled bulkheaded workers, Source Health
alerts (08). *Signal:* freshness SLO breach, failing-source count. *Owner:* Crawler lead.

**AR-4 — AI hallucination / grounding failure.** *Impact:* wrong eligibility → legal/trust harm.
*Mitigation:* grounding gate, evals with hallucination guardrail, deterministic eligibility, human
oversight (07). *Signal:* eval regression, grounding-fidelity drop. *Owner:* AI architect.

**AR-5 — Sensitive-PII exposure.** *Impact:* catastrophic. *Mitigation:* field-level encryption,
least privilege, access logging, no-PII-in-logs, consent gate, secrets manager, breach plan (09).
*Signal:* anomalous access, DLP alerts. *Owner:* Security architect.

**AR-6 — Result-day surge outage.** *Impact:* fails on the most important day. *Mitigation:* buffered
alert fan-out, digest/stagger/backpressure, cached result pages, read replicas, load-shedding (11).
*Signal:* queue depth spikes, latency SLO breach. *Owner:* Platform lead.

**AR-7 — Cost outruns revenue.** *Impact:* unsustainable burn. *Mitigation:* model-gateway budgets,
caching, cost-aware channel routing, spot compute, cost-per-active-user SLO (07/11, PRD §30). *Signal:*
unit-cost trend. *Owner:* Architect + Finance.

**AR-8 — Event backbone SPOF.** *Impact:* propagation halts (search/alerts/history). *Mitigation:*
HA/replicated backbone, DLQs, outbox retains truth, degrade gracefully; consumers replay on recovery.
*Signal:* consumer lag, backbone health. *Owner:* Platform lead.

**AR-9 — Search quality degrades.** *Impact:* discovery + trust suffer. *Mitigation:* ranking quality
loop, A/B with guardrails, eligibility gate, spam suppression (06). *Signal:* apply-through / zero-
result rate. *Owner:* Search architect.

**AR-10 — Vendor lock-in.** *Impact:* costly migrations, reduced leverage. *Mitigation:* open
standards (K8s, Postgres, OpenSearch, S3/Kafka APIs, OTel, OIDC), ACL adapters (12). *Signal:*
proprietary-API creep in core. *Owner:* Principal architect.

**AR-11 — Eventual-consistency bugs.** *Impact:* confusing stale reads. *Mitigation:* clear
consistency boundaries (05 §8), idempotency, "updated moments ago" UX, strong consistency for money/
consent. *Signal:* user-reported staleness. *Owner:* App architect.

**AR-12 — Fraud/scam listings reach users.** *Impact:* brand ruin, user harm. *Mitigation:* Trust &
Safety subsystem, source-reliability + anomaly detection + review, withhold/demote, reporting (09,
PRD §28). *Signal:* fraud reports, anomaly flags. *Owner:* Trust & Safety lead.

**AR-13 — DR/backup unproven.** *Impact:* data loss / long outage. *Mitigation:* PITR, cross-region
backups, scheduled restore + DR drills, IaC rebuild (10). *Signal:* failed/absent drills. *Owner:*
DevOps lead.

**AR-14 — Compliance gap (DPDP/consent).** *Impact:* regulatory + trust risk. *Mitigation:* consent
gate, data-subject-rights workflows, residency, retention, grievance (09, PRD §34). *Signal:* audit
findings, unfulfilled rights requests. *Owner:* Security/Compliance.

**AR-15 — Deferred migration debt.** *Impact:* hitting pgvector/single-DB limits under load.
*Mitigation:* watch scale metrics, pre-plan pgvector→vector-DB and replica→shard migrations (05/12).
*Signal:* latency/size thresholds crossed. *Owner:* Data architect.

## 3. Review cadence
Reviewed each planning cycle and after any incident; new architectural risks added with an owner and
mitigation. P0 risks have explicit SLOs and dashboards (10/11).
