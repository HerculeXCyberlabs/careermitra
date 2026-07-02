# Purpose — `docs/04_Database`

## Why this domain exists

CareerMitra's trust promise (R11: no unverified data; R15: PII protection) and its 100M-user scale
target are ultimately enforced **in the data layer**. This domain defines the PostgreSQL write models
so that:

- **Every stored fact is correct and traceable.** Provenance columns, verification-gate columns, and
  constraints make "unverified data cannot be published" a schema-level guarantee, not a hope.
- **Sensitive PII is protected by construction.** Field-level encryption columns, access-log tables,
  and data-classification tagging implement R14–R17 at the storage layer.
- **Contexts stay independent.** One schema per bounded context and a strict "no cross-context foreign
  keys" rule keep the modular monolith cleanly extractable into services (Architecture §16).
- **History can never be "added later."** Append-only snapshot tables capture cutoffs, vacancies, and
  recruitments from day one (Principle 8 / PRD §11).
- **50+ engineers build against one schema.** A single, versioned, documented schema per context lets
  backend, AI, search, and analytics teams work in parallel without colliding.

## What this domain does NOT own

- **ORM / repository code** → `modules/<context>/adapters/outbound` (application layer).
- **Migration SQL files** → shipped with the owning module; this domain defines the *target* schema and
  the *migration strategy*, not the individual migration scripts.
- **Derived read models** (search index mappings, vector collections, cache shapes, lakehouse tables) →
  their respective architecture docs; they are rebuildable from events and are not the source of truth.
- **API request/response shapes** → `docs/05_API`.

## Success criteria

A database design in this domain is correct when: every table maps to a Domain Model entity; every
cross-cutting invariant (§7 of the Domain Model) is enforced by a constraint, trigger, or documented
application rule; no cross-context FK exists; every sensitive-PII column is classified and encrypted;
and every mutable aggregate has provenance, timestamps, and (where needed) optimistic-lock versioning.
