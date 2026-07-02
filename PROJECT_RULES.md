# PROJECT_RULES.md — CareerMitra

> The rules that govern this repository for its entire lifetime. They are **binding**, not
> advisory. A change that violates a rule is a defect — regardless of who or what authored it
> (human, Claude Code, Cursor, Copilot, Gemini). Each rule states the rule, the rationale,
> and how it is enforced (by review, CI, or automation).
>
> Governing context: `PROJECT_CONTEXT.md`. Machine-readable index: `PROJECT_MANIFEST.json`.

---

## Category 1 — Structure & documentation

### R1. Documentation-first
No feature, module, API, schema change, or capability merges without its documentation in the
correct location. A change that adds behaviour but no documentation is **incomplete**.
*Rationale:* the repo must be understandable by a new engineer or AI in minutes.
*Enforced by:* PR review + CI check that new modules ship a `README.md`.

### R2. One correct home per file
Every file belongs to exactly **one** folder, determined by `PROJECT_CONTEXT.md §7`,
`PROJECT_MANIFEST.json`, and the naming convention. No stray files at the repository root
outside the documented allow-list. No ad-hoc top-level folders.
*Rationale:* prevents project chaos; lets tooling and AI file things deterministically.
*Enforced by:* verification tooling + review.

### R3. Single source of truth (zero duplicate documentation)
A fact or document is authored in exactly one place. If two locations need it, one **owns**
it and the other **links** to it. Duplicate document titles or copy-pasted sections are
defects.
*Rationale:* duplicated docs drift and become lies.
*Enforced by:* review + duplicate-title check.

### R4. Numbered documentation domains, never renamed casually
Top-level documentation domains are **numbered** (`00_…` through `99_…`, e.g. `00_Overview`,
`04_Database`, `05_API`, `06_Security`). A new domain slots into the scheme; it never spawns a
parallel taxonomy. Renaming or renumbering a domain requires an accepted decision record.
*Rationale:* a stable, ordered spine scales to hundreds of modules.

### R5. Every documentation folder is self-describing
Each documentation domain folder contains, at minimum: `README.md`, `Purpose.md`,
`Naming.md`, `Examples.md`, `AI_RULES.md`. Missing any of these is a defect.
*Rationale:* a folder must explain itself to both humans and AI without external context.

### R6. Decisions are recorded (ADR)
Any architectural or cross-cutting decision (datastore choice, service boundary, protocol,
auth model, ingestion trust boundary) is captured as an **Architecture Decision Record** with
a status of `Proposed | Accepted | Superseded`. Code that contradicts an **Accepted** ADR is a
defect. Superseded ADRs are marked, never deleted.
*Rationale:* the *why* must survive personnel and tooling changes for 10+ years.

---

## Category 2 — Naming, versioning & change

### R7. Naming discipline
- Documentation files: `PascalCase.md` (or the domain's documented pattern, e.g. ADRs use
  `NNNN-kebab-title.md`, sprints use `sprint-NN/`).
- Source files: `kebab-case`; components: `PascalCase`; types/classes: `PascalCase`;
  constants and env keys: `SCREAMING_SNAKE_CASE`.
- Branches: `type/scope-short-summary`. Commits: **Conventional Commits**.
- Canonical **module** and **glossary** terms are used verbatim (see `PROJECT_CONTEXT.md`).
*Rationale:* deterministic names let the organizer and AI file work correctly.

### R8. Semantic Versioning & Conventional Commits
Publishable packages use **SemVer**. Commit messages follow **Conventional Commits** and drive
the changelog. Live API contracts are URL-versioned (`/v1`); a breaking contract becomes a new
version with an explicit deprecation window — never a silent break.
*Rationale:* predictable evolution; consumers are never surprised.

### R9. No placeholders in the main branch
`TODO`, `FIXME`, lorem ipsum, "example only" text, and stub data may exist on a branch but must
be resolved or explicitly ticketed before merge to `main`. Governance documents contain **no**
placeholders at any time.
*Rationale:* the foundation must always be trustworthy and complete.

### R10. Reversibility of automation
Any tooling that moves, cleans, or deletes files must support a **dry-run** mode and produce a
**rollback log**. Nothing the automation does is unrecoverable.
*Rationale:* automation must never be able to silently destroy work.

---

## Category 3 — Data trust (product-specific, non-negotiable)

### R11. No unverified official data is shipped
Opportunity data — deadlines, vacancies, eligibility, exam dates — passes the **verification
gate** before it is surfaced to an aspirant. Every published Opportunity carries provenance to
its source Notification. Displaying an unverified date or eligibility rule is a **severity-1
defect**, not a cosmetic issue.
*Rationale:* a wrong government deadline causes real, irreversible harm to a citizen.

### R12. Grounded intelligence
The **AI Career Assistant**, and any AI-driven guidance surface, must **ground** every factual
claim about deadlines, eligibility, or official process in verified platform data or a cited
official source. It must not fabricate official facts, must not guarantee outcomes ("you will
be selected", "you are definitely eligible"), and must clearly distinguish guidance from
official rulings. When unsure, it says so and points to the official source.
*Rationale:* an authoritative-sounding wrong answer is worse than no answer.

### R13. Consent-gated actions
No action is taken **on behalf of** an aspirant without their explicit, per-action consent.
This applies especially to the **Form Filling Service** (never auto-submits an official form
without confirmation) and any outbound communication. Consent is recorded and auditable.
*Rationale:* the platform is a companion, not an agent acting unsupervised on citizen affairs.

---

## Category 4 — Security & privacy (a gate, not a phase)

### R14. No secrets in version control
Secrets, tokens, connection strings, private keys, and real PII are **never** committed. The
`.env` family is git-ignored; only `.env.example` (keys, no values) is committed as the
contract. CI scans for leaked secrets.
*Rationale:* one leaked credential can compromise citizen data.

### R15. PII minimization, encryption & audit
Collect the minimum PII necessary. Encrypt PII in transit and at rest; apply field-level
encryption to the most sensitive attributes. **Never** log PII or secrets in plaintext. Every
read/write of sensitive PII — especially **Document Vault** contents — is access-logged with
actor and purpose.
*Rationale:* privacy is a core promise of the product and a legal obligation.

### R16. Highest-sensitivity subsystems get extra scrutiny
Changes to the **Document Vault**, **Resume Parser**, **Form Filling Service**, **identity/
auth**, or the **ingestion trust boundary** require the **Security Review** process and a
security-owner approval before merge. Credentials for external government portals are **never**
stored by the Form Filling Service.
*Rationale:* these subsystems handle the crown-jewel data and the riskiest actions.

### R17. Least privilege
Every service, job, and integration uses scoped, least-privilege credentials. No shared
super-user access. Access is granted by role and reviewed.
*Rationale:* limits blast radius of any compromise.

---

## Category 5 — Engineering discipline

### R18. Automation over tribal knowledge
If a rule can be checked or fixed by a script, it must be — humans and AI should not have to
remember what CI can enforce. Extend the tooling instead of adding undocumented convention.
*Rationale:* the repo must self-organize and stay correct without heroics.

### R19. Tests accompany logic
New behaviour ships with tests covering the happy path, boundaries, and failure modes. Tests
are deterministic — no reliance on network or wall-clock. Critical aspirant journeys
(discover → check eligibility → save → get reminded) are covered end-to-end.
*Rationale:* trust requires proof that behaviour is correct and stays correct.

### R20. Accessibility & internationalization are requirements
Every user-facing surface meets **WCAG 2.1 AA**, is keyboard operable, and has translatable
strings (no concatenated sentences). These are acceptance criteria, not backlog items.
*Rationale:* the primary user is mobile-first and often a second-language reader.

---

## Enforcement summary

| Enforced primarily by | Rules |
|---|---|
| CI / automated checks | R1, R2, R3, R9, R14, R19 |
| Automation tooling (dry-run + rollback) | R2, R10, R18 |
| Mandatory review process | R6, R11, R12, R13, R16, R20 |
| Architectural governance (ADR) | R4, R6, R8 |
| Security review (gated) | R14–R17 |

A pull request is **not mergeable** until every applicable rule is satisfied. When a rule and a
deadline conflict, the rule wins — escalate, don't bypass.
