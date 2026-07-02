# CareerMitra — Architecture Decision Records (`docs/10_ADR`)

| | |
|---|---|
| **Domain** | `10_ADR` — the living log of implementation-level architecture decisions |
| **Version** | 1.0 · **Status** | Active |
| **Last updated** | 2026-07-01 |
| **Governed by** | `PROJECT_RULES.md` R6 (decisions are recorded), R4/R8 (ADR-gated changes) |

> An **ADR (Architecture Decision Record)** captures one significant technical decision: its **context**,
> the **decision**, its **consequences** (trade-offs), and the **alternatives** rejected — so the *why*
> survives personnel and tooling changes for 10+ years. Per R6, *"code that contradicts an Accepted ADR is
> a defect,"* and superseded ADRs are marked, never deleted.

---

## 1. Two ADR homes (and how they relate)
CareerMitra keeps ADRs in two places by altitude — this is deliberate, not duplication (R3):

| Home | Holds | Number range |
|---|---|---|
| `docs/02_Architecture/14_DECISION_RECORDS.md` | The **architecture-level** decisions (monolith shape, datastore family, integration style, auth model, region strategy). A single summarized file. | **0001–0016** |
| `docs/10_ADR/` *(this folder)* | **Ongoing / implementation-level** decisions (schema layout, id strategy, encryption pattern, API conventions, library choices). **One file per ADR.** | **0017 onward** |

The two share **one continuous number space** so any ADR reference (e.g. "ADR-0019") is globally
unambiguous. Implementation ADRs **cite the architecture ADR they refine** (e.g. 0017 refines 0003).

## 2. Index (implementation ADRs)
| ID | Title | Status | Refines |
|---|---|---|---|
| [0017](0017-schema-per-bounded-context.md) | Schema-per-bounded-context in one PostgreSQL database | Accepted | ADR-0001, ADR-0003 |
| [0018](0018-uuidv7-primary-keys.md) | UUIDv7 as the primary-key strategy | Accepted | ADR-0003 |
| [0019](0019-no-cross-context-foreign-keys.md) | No cross-context foreign keys | Accepted | ADR-0001, ADR-0002 |
| [0020](0020-envelope-encryption-sensitive-pii.md) | Envelope encryption for sensitive-PII fields | Accepted | ADR-0010, ADR-0012 |
| [0021](0021-money-as-integer-minor-units.md) | Money stored as integer minor units | Accepted | ADR-0012 |

## 3. Lifecycle
`Proposed` → `Accepted` → `Superseded`. To change an Accepted decision, write a **new** ADR that supersedes
it (link both ways); never edit the old one's decision or delete it. Status and links live in this index.

## 4. How to add an ADR
1. Copy the template in `Examples.md`.
2. Number it next in sequence (currently: next is **0022**).
3. Fill Context / Decision / Consequences / Alternatives / Enforcement.
4. Set status `Proposed`, open a PR; on approval flip to `Accepted` and add a row to §2.

## 5. Related
- Architecture ADR summary → `docs/02_Architecture/14_DECISION_RECORDS.md`
- Database design these ADRs govern → `docs/04_Database/`
- Binding rules → `PROJECT_RULES.md`
