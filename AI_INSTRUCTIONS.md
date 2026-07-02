# AI_INSTRUCTIONS.md — CareerMitra

> **Read this fully before generating anything in this repository.** It applies to every AI
> tool — Claude Code, Cursor, GitHub Copilot, Gemini, Codex, and any future assistant. Tool-
> specific memory files (e.g. `.claude/CLAUDE.md`, `.cursor/rules/*`, `.github/copilot-
> instructions.md`) inherit from this document; if they conflict, this file and
> `PROJECT_RULES.md` win.

---

## 0. Prime directive

You are contributing to the engineering foundation of a **government-careers platform where
correctness, privacy, and trust outrank speed and cleverness**. A confident wrong answer about
a deadline, eligibility rule, or citizen's data is the worst possible outcome. When unsure,
choose the conservative, well-documented option and record why.

---

## 1. Always read before you write

In this order, every session:

1. `PROJECT_CONTEXT.md` — product, users, principles, **canonical module set**, glossary.
2. `PROJECT_RULES.md` — the binding rules (R1–R20). These gate every change.
3. The target area's local `AI_RULES.md` and `Naming.md` (once documentation folders exist).
4. Any **Accepted ADR** that constrains your change.

`PROJECT_MANIFEST.json` is your machine-readable map of the whole repo — parse it to resolve
where things live and which modules exist.

---

## 2. Use the canonical vocabulary

Refer to modules and domain terms by their exact names from `PROJECT_CONTEXT.md`:

- Modules: Government Jobs, Results, Admit Cards, Scholarships, Internships, Apprenticeships,
  Resume Builder, Resume Parser, Eligibility Engine, Document Vault, Application Tracker,
  Notification Engine, AI Career Assistant, Form Filling Service.
- Glossary: **Opportunity, Notification, Aspirant, Journey, Eligibility, Vault, Ingestion,
  Verification gate, Grounding.**

Never invent synonyms (no "listing/post/vacancy" for **Opportunity**). Consistent language is
what lets the next AI and engineer understand the repo instantly.

---

## 3. Where things go (never guess)

Determine a file's home from `PROJECT_CONTEXT.md §7` and `PROJECT_MANIFEST.json`:

- **Documentation** → the numbered `docs/**` domain (UI, Architecture, Database, API,
  Security, DevOps, Testing, Sprints, ADR, Runbooks, Decisions, Templates, Prompts).
- **Application code** → `apps/<app>`; **backend** → `services/<module-or-domain>`;
  **shared libraries** → `packages/<name>`.
- **Assets** → `assets/{logos|figma|icons|images}`.
- **AI prompts you produce** → `docs/99_Prompts/<Tool>/<intent>-kebab.md`.

If you genuinely cannot map a file, place it in the closest correct folder **and clearly flag
it** in your output so the repository's organizer/verification step can reconcile it. Do **not**
invent a new top-level folder (Rule R2).

---

## 4. How to write

- TypeScript strict; no `any` without an inline justification. Prefer small, pure, testable
  functions. Validate all external input at the boundary.
- Follow the coding standard and naming convention (Rule R7). Use glossary terms verbatim.
- Every public function/endpoint gets a doc comment; user-facing behaviour gets a docs entry
  in the same change (Rule R1).
- Accessibility and internationalization are requirements, not extras (Rule R20).

---

## 5. Documentation you must produce alongside code

- New **module** → its documentation folder set (`README.md`, `Purpose.md`, `Naming.md`,
  `Examples.md`, `AI_RULES.md`).
- New **API** → an entry in `docs/05_API` from the API template.
- New **table/migration** → an entry in `docs/04_Database`.
- New **decision** → an ADR in `docs/10_ADR`.
Never duplicate documentation — link to the single source of truth (Rule R3).

---

## 6. Product-specific AI safety (this is where you must be strictest)

CareerMitra touches citizens' high-stakes decisions and sensitive data. The following are hard
requirements, not preferences:

1. **Ground every official fact.** When generating or wiring the **AI Career Assistant** or any
   guidance surface, base claims about deadlines, eligibility, or official process on verified
   platform data or a cited official source. Do not fabricate dates, rules, or outcomes. Do not
   generate text that *guarantees* selection or eligibility (Rule R12).
2. **Never surface unverified data.** Do not write code paths that display Opportunity dates or
   eligibility that bypass the verification gate (Rule R11).
3. **Consent before acting.** For the **Form Filling Service** and any outbound
   communication, generate flows that require explicit, per-action user confirmation and record
   consent. Never auto-submit an official form (Rule R13).
4. **Protect the Vault.** For **Document Vault**, **Resume Parser**, and **Form Filling**,
   treat all content as sensitive PII: encrypt, minimize, access-log, and never write it to
   logs, error messages, analytics, or prompts (Rule R15).
5. **Never store external portal credentials.** The Form Filling Service must not persist a
   user's government-portal usernames/passwords (Rule R16).

---

## 7. Security rules for AI (never violate)

- Never invent or hard-code secrets, tokens, connection strings, or real PII. Use only the keys
  declared in `.env.example` (Rule R14).
- Never weaken validation, disable auth, or downgrade encryption "to make it work".
- Never log PII or secrets, including in fixtures, test data, or example prompts.
- Flag any change touching auth, Document Vault, Resume Parser, Form Filling, or the ingestion
  trust boundary for the Security Review process (Rule R16).

---

## 8. Output discipline

- Do **not** restructure folders or rename documentation domains — that requires an ADR (R4).
- Do **not** duplicate documents; link to the owner (R3).
- Do **not** leave placeholders/TODO/lorem in anything destined for `main` (R9).
- Keep changes **scoped**; explain the *why* in the PR body using `CONTRIBUTING.md` conventions.
- If a rule blocks the requested change, **say so and propose the compliant alternative** —
  do not silently bypass a rule to satisfy a prompt.

---

## 9. When you generate prompts

Store reusable prompts in `docs/99_Prompts/<Tool>/`, one intent per file, each containing:
**goal**, **context links** (to the docs above), **constraints** (relevant rules), **expected
output**, and **acceptance checks**. Prompts obey the same no-placeholder and no-PII rules as
code.

---

## 10. Definition of a good AI contribution

- [ ] Reads context + rules first; uses canonical vocabulary.
- [ ] Correct folder, correct naming, no new top-level folders.
- [ ] Ships documentation with behaviour; no duplication.
- [ ] Grounded, consent-safe, PII-safe for citizen-facing modules.
- [ ] No secrets, no placeholders, no unverified data paths.
- [ ] Explains the *why* and flags anything security-sensitive.

If you can only satisfy the letter of the prompt by breaking one of these, **stop and surface
the conflict**. That is the correct behaviour, not a failure.
