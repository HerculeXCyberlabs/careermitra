# Examples — `docs/10_ADR`

## The ADR template (copy this)

```markdown
# ADR-NNNN — <Short decision title>

| | |
|---|---|
| **Status** | Proposed |
| **Date** | YYYY-MM-DD |
| **Deciders** | <role/team> |
| **Refines** | ADR-XXXX (architecture) — or "none" |
| **Scope** | <e.g. Database implementation / API> |

## Context
The forces, constraints, and problem that make a decision necessary. Reference the PRD, Domain Model,
architecture docs, or rules that apply. State what breaks if we don't decide.

## Decision
The choice, stated plainly in one or two sentences, then any necessary specifics (the "how").

## Consequences
### Positive
- Concrete benefits gained.

### Trade-offs / negative
- Real costs accepted. Be honest — every decision has these.

## Alternatives considered
- **<Option A>** — why rejected.
- **<Option B>** — why rejected.

## Enforcement & compliance
- Which `PROJECT_RULES.md` rule this satisfies, and where it is realized/enforced (a `docs/04_Database`
  doc, a CI check, a lint rule). This is what makes the ADR binding rather than advisory.
```

## Worked example
See `0019-no-cross-context-foreign-keys.md` — a compact, complete implementation ADR that refines two
architecture ADRs and cites its enforcement in `docs/04_Database/01_SCHEMA_OVERVIEW.md §2`.

## Good vs weak ADRs
| Weak | Good |
|---|---|
| "We use UUIDs." | "We use **UUIDv7** because we need app-generated, cross-context-unique, *time-sortable* keys; v4 fragments indexes; bigserial can't be generated before insert (needed for the outbox)." |
| Lists only benefits | Lists the 16-byte cost, non-human-readable keys, and how they're mitigated |
| Silently changes ADR-0003 | Writes ADR-0017 that *refines* ADR-0003 and links it |
| No enforcement | "Enforced by the boundary lint in `13_FOLDER_STRUCTURE.md §4` and Overview §2" |
