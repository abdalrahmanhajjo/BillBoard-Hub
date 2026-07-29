# Admin financial management

Tracks what the billboard network **costs the company**, measured against the revenue the
advertiser side already records.

## The boundary that matters

Two separate financial concepts share the app and must never be merged:

| Money in (existing)                        | Money out (this module)                    |
| ------------------------------------------ | ------------------------------------------ |
| Reservations, invoices, Stripe, Cash/Whish | Rent, permits, power, maintenance, payroll |
| `bookings` + `payments` collections        | `expenses` + `owner_payments` collections  |
| `PAYMENTS_*` permissions                   | `FINANCE_*` permissions                    |
| Advertiser and admin                       | **Admin only**                             |

The finance module **reads** bookings to compute revenue and never writes to them, so a
profitability calculation cannot alter what a customer owes. The reservation payment flow is
untouched.

## Reporting currency and FX

Every amount is stored in its original currency **and** converted to a single reporting currency
(`FINANCE_BASE_CURRENCY`, USD) as `baseAmount`. All aggregation sums `baseAmount`.

A non-USD amount **requires** an `exchangeRate`; the request is rejected with a 400 otherwise.
This is deliberate — defaulting a missing rate to 1:1 would book 1,000,000 LBP as $1,000,000 and
corrupt every downstream total. The rate is stored per record, so correcting tomorrow's rate never
silently rewrites last month's report.

## Structure

```
src/shared/constants/finance.ts          categories, statuses, methods, recurrence
src/shared/types/finance.ts              Expense, BillboardOwner, OwnerPayment, FinanceOverview
src/shared/finance/finance-math.ts       pure arithmetic (FX, margin, occupancy) + tests
src/shared/contracts/finance/*.schema.ts Zod validation
src/shared/policies/modules/finance-policy.ts
src/server/modules/finance/
  expense.model.ts  owner.model.ts  finance-audit.model.ts
  finance.repository.ts        aggregation pipelines
  expense.service.ts           expense lifecycle + audit
  owner.service.ts             owners, payments, settlement
  financial-report.service.ts  revenue x expenses -> profitability
  finance.controller.ts
src/app/api/v1/finance/*       routes
src/client/features/finance/*  admin UI
```

Route → Controller → Service → Repository → Database, matching every other module.

## Permissions

`FINANCE_VIEW`, `FINANCE_CREATE`, `FINANCE_UPDATE`, `FINANCE_DELETE` — granted to `admin` only in
`ADMIN_PERMISSIONS`, absent from `ADVERTISER_PERMISSIONS`.

The policy asserts **both** the permission and `role === admin`. That redundancy is intentional: if
a permission were ever mis-assigned to another role, the role check still refuses. Verified: an
advertiser gets `403` and an anonymous request `401` on every finance endpoint, with no data in the
body.

## Screens

| Route                          | Purpose                                                   |
| ------------------------------ | --------------------------------------------------------- |
| `/user/admin/finance`          | Revenue vs expenses, category split, profit per billboard |
| `/user/admin/finance/expenses` | Record and filter costs                                   |
| `/user/admin/finance/payments` | Owner/vendor payouts, mark paid                           |
| `/user/admin/finance/reports`  | Profitability table, monthly ledger, CSV export           |
| `/user/admin/owners`           | Owner directory with balances                             |

> The brief specified `/admin/finance`. These live under `/user/admin/...` so they inherit the
> existing admin layout guard and sidebar shell rather than introducing a second protected root.

## Definitions

- **Revenue** — `pricing.total` of reservations that are `approved` or `completed`, attributed to
  the month the campaign starts (the same rule the advertiser dashboard uses, so the two agree).
- **Gross profit** — revenue less direct billboard costs (the `billboard` category group).
- **Net profit** — revenue less all costs, including government and business overhead.
- **Margin** — `net / revenue`, or `null` when revenue is zero. Not `0%`: "no revenue" and "0%
  margin" are different facts.
- **Occupancy** — booked days ÷ window days, clamped to 100%. Digital screens rotate several ads at
  once, so raw booked days can exceed the window.
- **Cancelled expenses** — retained for audit, excluded from every total.

## Audit history

Every create, update, status change, and delete writes an append-only row to `finance_audit` with
the actor, a summary, and a field-level diff. Nothing in the module updates or deletes those rows.

Owners with payments or expenses attached cannot be deleted — the API returns 409 and directs the
operator to deactivate instead, so historical profit figures never change retroactively.

## Verification performed

Against a real database: created owner, three expenses ($1,000 rent + $150 electricity + $100
maintenance) and a $4,000 approved reservation on one billboard. The module reported **net profit
$2,750, margin 68.75%** — the worked example in the original brief. A 9,000,000 LBP cost at rate
0.000011 converted to $99. `finance-math.test.ts` covers the arithmetic (19 cases).
