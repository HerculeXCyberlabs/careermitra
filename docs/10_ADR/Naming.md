# Naming — `docs/10_ADR`

Extends `PROJECT_RULES.md §R7` (ADRs use `NNNN-kebab-title.md`).

## Files
| Item | Convention | Example |
|---|---|---|
| ADR file | `NNNN-kebab-title.md`, zero-padded 4-digit number | `0019-no-cross-context-foreign-keys.md` |
| ADR number | **continuous with the architecture summary** — next free is 0022 | `0022-...` |
| Title | short imperative/noun phrase, kebab-case in filename, Title Case in the `# ADR-NNNN — …` heading | `# ADR-0018 — UUIDv7 as the primary-key strategy` |
| Self-describing files | `README.md`, `Purpose.md`, `Naming.md`, `Examples.md`, `AI_RULES.md` (R5) | — |

## Numbering rules
- **One global sequence.** Architecture-level ADRs occupy 0001–0016 (in
  `docs/02_Architecture/14_DECISION_RECORDS.md`); implementation ADRs continue at 0017+. Never reuse or
  reset numbers.
- A number, once assigned, is permanent — even if the ADR is later `Superseded`.

## Status vocabulary (exact)
`Proposed` · `Accepted` · `Superseded`. No other values. A superseded ADR names its successor; the
successor names what it supersedes.

## References
- Refer to an ADR as `ADR-NNNN` in prose across the repo.
- When an implementation ADR refines an architecture one, state it in a `Refines` header field and link.
