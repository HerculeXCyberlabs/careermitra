# Purpose — `docs/10_ADR`

## Why this domain exists
`PROJECT_RULES.md R6` requires that **every architectural or cross-cutting decision** (datastore choice,
service boundary, protocol, auth model, id strategy, encryption pattern, ingestion trust boundary) is
recorded as an Architecture Decision Record with a status of `Proposed | Accepted | Superseded`. This
folder is the home for the **ongoing, implementation-level** ADRs that the architecture-level summary
(`docs/02_Architecture/14_DECISION_RECORDS.md`) explicitly defers here.

The value is preservation of **rationale**: code and schemas show *what* the system does; an ADR preserves
*why* it is that way, so a future engineer changes it **knowingly, not accidentally**. For a product meant
to last a decade and be built by 50+ engineers, the lost-hallway-conversation problem is a real risk; ADRs
are the mitigation (Risk RK-15, key-person/knowledge risk).

## What belongs here (implementation altitude)
- Database implementation decisions (schema layout, keys, encryption, money representation).
- API conventions and versioning decisions (as `docs/05_API` lands).
- Library/tool selections that are ADR-gated (migration tool, validation library, etc.).
- Any concrete realization choice that refines an architecture ADR.

## What does NOT belong here
- **Architecture-altitude decisions** → `docs/02_Architecture/14_DECISION_RECORDS.md` (ADR-0001–0016).
- **Product/process (non-architectural) decisions** → `12_Decisions` (per the manifest taxonomy).
- **Restating a decision already recorded** → link to the owner (R3). An implementation ADR *refines* an
  architecture ADR; it does not copy it.

## Success criteria
An ADR here is good when: it records exactly one decision; states the forces that required it; lists the
alternatives rejected and why; is honest about trade-offs (not just benefits); cites the architecture ADR
it refines and the `PROJECT_RULES.md` rule / `docs/04_Database` (or other) location where it is enforced.
