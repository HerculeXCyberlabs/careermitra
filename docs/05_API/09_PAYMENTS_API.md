# CareerMitra — Payments & Billing API

| | |
|---|---|
| **Surface** | Plans, subscriptions, orders, payments, invoices, refunds · **Context** | Payments & Billing (8) |
| **Audience** | Aspirant (finance operators separate) · **Assumes** | `01_API_STANDARDS.md` · **step-up on payment** |

> Money surface. **No card data touches this API** — payment capture uses the external provider's hosted
> flow (ADR-0012); we store only tokens/references. All amounts are `{ amount_minor, currency }` (ADR-0021).
> Orders and payment intents are idempotent. Premium never gates basic opportunity access.

## 1. Endpoints
| Method | Path | Auth / scope | Purpose | Maps to |
|---|---|---|---|---|
| `GET` | `/v1/plans` | public | Available premium plans | `payments.premium_plans` |
| `GET` | `/v1/me/subscription` | `billing.read` | Current subscription + entitlements | `payments.subscriptions` |
| `POST` | `/v1/me/orders` | `billing.write` + step-up + `Idempotency-Key` | Create an order (plan or service) | `payments.orders` |
| `GET` | `/v1/me/orders/{id}` | `billing.read` | Order status | `payments.orders` |
| `POST` | `/v1/me/orders/{id}:pay` | `billing.write` + step-up | Init hosted payment → provider redirect/token | `payments.payments` |
| `POST` | `/v1/payments/provider-webhook` | provider signature | Capture/settlement callback (S2S) | `payments.payments` |
| `GET` | `/v1/me/invoices` / `/{id}` | `billing.read` | List/download invoices | `payments.invoices` |
| `POST` | `/v1/me/orders/{id}:cancel` | `billing.write` | Cancel before capture | `payments.orders` |
| `GET` | `/v1/me/refunds` | `billing.read` | Refund status | `payments.refunds` |

> Refund **approval** is an operator/finance action (separate from the requester — SoD, R17) and lives in
> the Admin/Support surfaces, not here.

## 2. Key resource models
**Order (create)**
```json
{ "line_items": [ { "item_type": "plan", "item_ref": "plan_premium_annual", "quantity": 1 } ] }
```
**Pay (init)** → `{ "provider": "razorpay", "checkout_token": "<opaque>", "return_url": "..." }` — the client
completes payment on the provider; capture arrives via the signed webhook (idempotent by provider ref).

## 3. Surface errors
| Code | Status | Meaning |
|---|---|---|
| `ORDER_AMOUNT_MISMATCH` | 422 | Line items don't sum to order amount |
| `ORDER_NOT_PAYABLE` | 409 | Order not in a payable state |
| `PAYMENT_PROVIDER_ERROR` | 502 | Upstream provider failure |
| `IDEMPOTENCY_CONFLICT` | 409 | Same key, different order payload |

## 4. Rules realized
| Rule | How |
|---|---|
| ADR-0012 — no card data | hosted provider flow; only tokens/refs stored/returned |
| ADR-0021 — money integrity | `{ amount_minor, currency }`; sum checks |
| Idempotency (§7.14) | order/pay take `Idempotency-Key`; webhook dedup by provider ref |
| SoD on refunds (R17) | approval separated to operator surface |
| No dark patterns (§30.2) | premium additive; basic access never gated |
