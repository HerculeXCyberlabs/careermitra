# AI_RULES — `docs/10_ADR`

Rules for any AI tool writing or changing ADRs. Inherits `AI_INSTRUCTIONS.md` and `PROJECT_RULES.md`.

## Before writing an ADR
1. **Check both ADR homes first.** Read `docs/02_Architecture/14_DECISION_RECORDS.md` (0001–0016) and this
   folder's index. If the decision already exists, **do not restate it** (R3) — link to it, or write a new
   ADR that *refines* or *supersedes* it and say so explicitly.
2. Confirm the decision is real and made — an ADR records a decision, it is not a design scratchpad.

## Hard rules
- **One decision per ADR.** If you are recording two decisions, write two ADRs.
- **Continuous numbering.** Use the next free number in the single global sequence (do not reset to 0001).
  Never reuse a retired number.
- **Never edit an Accepted ADR's decision.** To change it, add a new ADR that supersedes it and cross-link;
  mark the old one `Superseded` in the index. History is preserved, never rewritten (R6).
- **Be honest about trade-offs.** Every ADR lists real negatives and the alternatives rejected with
  reasons. An ADR that only lists benefits is incomplete.
- **Cite enforcement.** State the `PROJECT_RULES.md` rule and the concrete location (e.g. a
  `docs/04_Database` doc, a CI check) where the decision is realized/enforced.
- **No placeholders** in a merged ADR (R9). No secrets or real PII in examples (R14).

## Structure (use the template in `Examples.md`)
Header table (Status/Date/Deciders/Refines/Scope) → Context → Decision → Consequences (Positive +
Trade-offs) → Alternatives considered → Enforcement & compliance.
