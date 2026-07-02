# ADR-0019 — No cross-context foreign keys

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-01 |
| **Deciders** | Engineering (Astralabs) |
| **Refines** | ADR-0001 (Modular Monolith), ADR-0002 (Event-driven + outbox) |
| **Scope** | Database implementation |

## Context
With schema-per-context (ADR-0017) in one database, PostgreSQL *can* physically create a foreign key from
one context's table to another's. Doing so would weld the contexts together at the storage layer:
extraction to a separate service (Architecture §16) would become a rewrite, and it would violate the
"no cross-context shared tables / integrate via events" rule (Domain Model §10). We must decide whether the
database enforces cross-context referential integrity.

## Decision
**A foreign-key constraint may reference only a table in the same schema.** Cross-context relationships are
stored as **bare canonical `uuid`s with no FK constraint**, validated at the application boundary, and kept
consistent via domain events (ADR-0002). Example: `recruitment.opportunities.organization_id` is a `uuid`
documented as *"canonical id → `reference.organizations` (no FK; validated in app)."*

## Consequences
### Positive
- Contexts stay extractable — a schema becomes a service without unpicking database-level joins.
- Enforces the event-driven integration contract; no hidden coupling via referential integrity.
- Reference data can evolve (merges, ADR-0017 `reference` kernel) without cascading FK constraints across contexts.

### Trade-offs / negative
- The database will **not** guarantee cross-context referential integrity — the application and events must.
  Stale references are tolerated by design and reconciled by events.
- Requires validation logic on write and defensive reads; more application responsibility.

## Alternatives considered
- **Cross-context FKs for integrity** — rejected: couples contexts, blocks extraction, breaks Domain Model §10.
- **Database views/synonyms spanning schemas** — rejected: same coupling by another name.
- **A single shared schema** — rejected in ADR-0017.

## Enforcement & compliance
The most important rule in `docs/04_Database/01_SCHEMA_OVERVIEW.md §2`; every per-context schema marks
cross-context columns as "canonical id … (no FK)". Realizes Domain Model §10 and R2. Paired with the
architecture boundary lint (`13_FOLDER_STRUCTURE.md §4`) which forbids a module importing another module's
internals; the DB rule is the storage-layer counterpart and should be checked in CI (schema linter).
