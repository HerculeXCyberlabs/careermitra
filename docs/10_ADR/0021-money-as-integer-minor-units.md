# ADR-0021 — Money stored as integer minor units

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-01 |
| **Deciders** | Engineering (Astralabs) |
| **Refines** | ADR-0012 (external PCI payments) |
| **Scope** | Database implementation |

## Context
The Payments context (Domain Model §5.8) stores plans, orders, payments, invoices, and refunds, and must
reconcile amounts exactly (`ck_orders_amount = sum(line_items)`, invoice totals, refund ≤ captured).
Floating-point representations introduce rounding errors that are unacceptable for money. We must decide the
storage representation for monetary values platform-wide.

## Decision
Store every monetary value as an **integer count of the currency's minor unit** in `amount_minor bigint`,
paired with `currency char(3)` (ISO 4217). Example: ₹499.00 is `amount_minor = 49900`, `currency = 'INR'`.
No `float`/`double`/`real`, and no bare `numeric` "rupees" columns.

## Consequences
### Positive
- Exact arithmetic — no binary floating-point rounding; sums and comparisons are precise.
- `bigint` range comfortably covers any realistic amount; simple, fast, index-friendly.
- Explicit `currency` keeps values self-describing and multi-currency-ready (localized pricing, PRD §30).

### Trade-offs / negative
- Presentation must divide by the currency's minor-unit scale (e.g. /100) — a UI/formatting concern.
- Currencies with non-2-decimal minor units require the scale to be derived from `currency`, not assumed.

## Alternatives considered
- **`numeric(12,2)`** — acceptable for exactness but invites accidental float coercion in app code and
  assumes 2 decimals; integer minor units are less error-prone across languages.
- **Floating point (`real`/`double`)** — rejected outright: rounding errors, forbidden for money.
- **String amounts** — rejected: no arithmetic, error-prone.

## Enforcement & compliance
Defined in `docs/04_Database/01_SCHEMA_OVERVIEW.md §3` and `Examples.md §6`; applied throughout
`09_PAYMENTS_SCHEMA.md` (`price_minor`, `amount_minor`, `tax_minor`, `total_minor`) and
`recruitment.application_forms.fee_minor`. Supports the money-integrity invariant (Domain Model §5.8) and
reconciliation constraints.
