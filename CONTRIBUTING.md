# CONTRIBUTING.md — CareerMitra

> How work gets done in this repository. This workflow is designed so a new engineer — or an
> AI acting as a contributor — is productive in minutes and the repository stays clean without
> anyone policing it by memory. It operationalizes `PROJECT_RULES.md`.

---

## 1. Before your first change

1. Read `PROJECT_CONTEXT.md`, then `PROJECT_RULES.md`, then `AI_INSTRUCTIONS.md`.
2. Understand the **canonical module set** and **glossary** — you must use those terms verbatim.
3. Confirm your local environment: Git, Node.js LTS (≥ 20), and pnpm. Copy `.env.example` to
   `.env` and fill values from the team's secret manager — never from another engineer over
   chat, and never commit `.env`.

*Note:* repository automation (verification and file-organizer tooling) is part of this
foundation. Where those scripts are present, run them as described below; where they are not
yet added, the same checks are performed in review and CI. The **rules do not depend on the
tooling existing** — the tooling only makes them automatic.

---

## 2. Pick up work

- Every change traces to an issue. If there isn't one, create it first (use the appropriate
  issue template once templates are in the repo; otherwise describe problem, scope, and
  acceptance criteria).
- Confirm no **Accepted ADR** conflicts with your intended approach. If your change *is* an
  architectural decision, write the ADR first (Rule R6).

---

## 3. Branch

Name branches `type/scope-short-summary`:

- Types: `feat, fix, docs, refactor, test, chore, perf, ci, build, security`.
- Scope is usually a canonical module (e.g. `eligibility-engine`, `document-vault`).
- Examples: `feat/eligibility-engine-category-rules`, `fix/admit-cards-download-404`,
  `docs/adr-ingestion-verification-gate`.

---

## 4. Do the work — documentation-first

1. If it's a new area, scaffold its documentation folder set first
   (`README.md`, `Purpose.md`, `Naming.md`, `Examples.md`, `AI_RULES.md`).
2. Write the spec/doc, then the implementation (Rule R1).
3. Keep every file in its correct home (Rule R2). If unsure where a file belongs, consult
   `PROJECT_CONTEXT.md §7` and `PROJECT_MANIFEST.json`, or run the organizer in **dry-run**
   mode when available.
4. For citizen-facing modules, apply the product-trust and privacy rules deliberately:
   grounded intelligence (R12), verified data only (R11), consent-gated actions (R13), and
   PII protection (R15). These are acceptance criteria, not afterthoughts.

---

## 5. Commit — Conventional Commits

```
<type>(<scope>): <summary in imperative mood>

<body: explain the WHY, not just the what>

Refs: #<issue>
```

Example:

```
feat(eligibility-engine): add category-based age relaxation rules

Encodes SC/ST/OBC age relaxation as declarative rules so eligibility results
are explainable and auditable. Rules are data, not code branches.

Refs: #142
```

Commit types map to release impact (see `PROJECT_RULES.md` R8 and versioning). Breaking changes
use `type!:` or a `BREAKING CHANGE:` footer.

---

## 6. Self-check before you push

Run this checklist (automated by verification tooling/CI where present):

- [ ] Files are in their correct folders; no new top-level folders (R2).
- [ ] New behaviour ships with documentation; nothing duplicated (R1, R3).
- [ ] Naming follows the convention; glossary terms used verbatim (R7).
- [ ] Tests cover happy path, boundaries, and failures; deterministic (R19).
- [ ] Accessibility and i18n satisfied for any user-facing surface (R20).
- [ ] No secrets, no real PII, no PII in logs; `.env` not committed (R14, R15).
- [ ] No placeholders/TODO/lorem destined for `main` (R9).
- [ ] ADR added if the change is architectural (R6).
- [ ] Citizen-trust rules satisfied for affected modules (R11–R13).

---

## 7. Open a pull request

Use the PR template (once present). A PR must:

- Link its issue and state the **why**.
- Include documentation for any new behaviour (R1).
- Pass the verification checklist and CI.
- Receive at least one code-owner review.
- Receive a **Security Review** if it touches the Document Vault, Resume Parser, Form Filling
  Service, identity/auth, or the ingestion trust boundary (R16).

Keep PRs small and single-purpose — they are easier to review and safer to revert.

---

## 8. Review standards

Reviewers check for rule compliance first, then design, then style (style is mostly automated).
A reviewer approves only when they would be comfortable maintaining the change themselves.
Disagreements are resolved by the relevant ADR or by writing one. Be direct, be kind, attack the
problem, not the person.

---

## 9. Definition of Done

A change is done when:

- Code + tests + documentation are complete and in the correct folders.
- Verification and CI are green.
- No secrets, no placeholders, no duplicate docs, no unverified-data or non-consented paths.
- Any architectural decision is captured as an Accepted ADR.
- The Conventional Commit history clearly implies the changelog entry.

---

## 10. Getting help

- "What is this project?" → `PROJECT_CONTEXT.md`.
- "Am I allowed to do this?" → `PROJECT_RULES.md`.
- "Where does this file go?" → `PROJECT_CONTEXT.md §7` + `PROJECT_MANIFEST.json`.
- "How should an AI tool behave here?" → `AI_INSTRUCTIONS.md`.
- Precedent and past decisions → the ADR domain (`docs/10_ADR`).

The repository is designed to answer most questions by itself. If it can't, that's a gap —
fix the documentation as part of your change so the next person doesn't hit the same wall.
