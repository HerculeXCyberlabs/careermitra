# ADR-0018 — UUIDv7 as the primary-key strategy

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-01 |
| **Deciders** | Engineering (Astralabs) |
| **Refines** | ADR-0003 (PostgreSQL primary) |
| **Scope** | Database implementation |

## Context
Every table needs a primary key. Keys in this system must be: **unique across 16 contexts** (and future
extracted services) so ids never collide when data moves; **generatable in the application before insert**
(the transactional outbox, ADR-0002, writes an event carrying the aggregate id in the same transaction);
and **index-friendly** at 100M-user scale. We must choose one strategy platform-wide.

## Decision
Use **UUIDv7** (time-ordered UUID), stored as PostgreSQL `uuid`, as the primary key (`id`) of every table.
Public/SEO surfaces use a separate human-readable `slug`, never the raw id.

## Consequences
### Positive
- Globally unique across contexts and future services — safe to move/reference data anywhere.
- App-side generation before insert enables the outbox and avoids a DB round-trip for the id.
- **Time-sortable**, so inserts hit the right end of the B-tree — avoids the index fragmentation and page
  splits that random UUIDv4 causes.

### Trade-offs / negative
- 16 bytes vs 8 for `bigint` — larger keys/indexes; accepted for the uniqueness/portability benefit.
- Not human-friendly — mitigated by `slug`s on user-facing entities.
- Embeds a coarse timestamp — acceptable (not a secret); ids are internal, not guessable resources.

## Alternatives considered
- **`bigserial` / identity sequences** — rejected: not unique across contexts/services, can't be generated
  before insert, and sequence coordination is painful post-extraction.
- **UUIDv4 (random)** — rejected: index fragmentation and poor insert locality at scale.
- **Natural keys** — rejected: government reference data is messy and mutable; stable surrogate keys are
  required (Domain Model §1.2 — canonical identities).

## Enforcement & compliance
Specified as a standard column in `docs/04_Database/01_SCHEMA_OVERVIEW.md §3`. Every per-context schema doc
declares `id uuid PRIMARY KEY`. Supports ADR-0002 (outbox) and ADR-0019 (cross-context references are bare
`uuid`s).
