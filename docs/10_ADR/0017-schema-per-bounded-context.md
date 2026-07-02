# ADR-0017 — Schema-per-bounded-context in one PostgreSQL database

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-01 |
| **Deciders** | Engineering (Astralabs) |
| **Refines** | ADR-0001 (Modular Monolith), ADR-0003 (PostgreSQL primary) |
| **Scope** | Database implementation |

## Context
The system has 16 bounded contexts (Domain Model §3) built as a modular monolith (ADR-0001) on PostgreSQL
(ADR-0003). We need each context's data to be **isolated** (so contexts stay independently
understandable and later extractable to services, Architecture §16) without paying the operational cost of
16 separate databases at pre-scale. We must pick a physical layout that expresses the boundaries.

## Decision
Use **one PostgreSQL database with one named schema per bounded context** (`identity`, `reference`,
`recruitment`, `career`, `documents`, `ai`, `search`, `payments`, `services`, `crawler`, `content`,
`admin`, `support`, `analytics`, `growth`, `notifications`). Each context owns its schema exclusively;
`reference` is the shared kernel that others reference by id.

## Consequences
### Positive
- Clean, visible seams — a schema *is* a context boundary; nothing is shared implicitly.
- One instance to operate, back up, and connect to at MVP; low ops cost.
- Extraction is a **move, not a rewrite**: a schema lifts to its own database on service extraction with
  its boundary intact.

### Trade-offs / negative
- All contexts share one instance's resources until a context needs independent scaling.
- Discipline required: the "no cross-context foreign keys" rule (ADR-0019) must be enforced, since the
  database *could* physically join across schemas.

## Alternatives considered
- **One database, one shared schema (public)** — rejected: no boundary, invites cross-context coupling.
- **One database per context now** — rejected: premature ops cost/complexity at pre-scale (16 DBs, 16
  connection pools, cross-DB consistency) for no benefit yet.
- **Single-table/document store** — rejected: weakens the relational integrity money/identity/recruitment
  need (see ADR-0003).

## Enforcement & compliance
Realizes R2 (one correct home) and the Domain Model §10 "no cross-context shared tables" rule. Layout
specified in `docs/04_Database/01_SCHEMA_OVERVIEW.md §1`; each schema documented in `02`–`17`. Boundary
enforcement is paired with ADR-0019 and the architecture boundary lint (`13_FOLDER_STRUCTURE.md §4`).
