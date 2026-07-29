# Payments

Boardly accepts Visa through Stripe or an offline Cash/Whish payment. Stripe Elements verifies and
saves Visa details during reservation Step 3; raw card data never enters Boardly. This document
describes the implemented workflow and the production setup required to operate it safely.

## Business workflow

1. The advertiser selects Visa or Cash/Whish in reservation Step 3.
2. For Visa, the browser loads Stripe Elements from a server-created SetupIntent. Stripe verifies
   and saves the card without charging it.
3. The booking service retrieves that SetupIntent from Stripe, verifies its owner, completion
   state, and Visa network, then stores only Stripe reference IDs with the reservation.
4. An administrator checks inventory conflicts and approves the reservation.
5. Approval reserves the billboard dates and unlocks payment in **My bookings**.
6. For Visa payments, the server creates or reuses a 30-minute Stripe Checkout Session for the
   saved Stripe customer. Checkout blocks non-Visa card networks.
7. Stripe sends signed webhook events to Boardly. Boardly reconciles the `payments` record and the
   booking's payment status.
8. The Stripe success redirect also calls the same idempotent reconciliation logic. This makes the
   result screen immediate without replacing the webhook.
9. Cash/Whish payments are reconciled by an administrator from reservation details.

Pending reservations cannot be charged. This prevents two advertisers from paying for the same
dates before conflict resolution.

## Source of truth

- Stripe is the source of truth for card charge and refund results.
- MongoDB is the application ledger used by the reservation and administration interfaces.
- The booking stores the Stripe customer, SetupIntent, and PaymentMethod IDs needed to reuse the
  verified Visa. These values are provider references, not card credentials.
- The `bookings.paymentStatus` field is a denormalized operational status.
- The `payments` collection stores provider identifiers, expected amount, received amount,
  attempts, timestamps, method, and reconciliation notes.
- The `payment_events` collection stores processed Stripe event IDs to make webhook handling
  idempotent.

Card details never pass through or persist in Boardly. Stripe Elements and Checkout collect them
inside Stripe-hosted fields.

## Required environment variables

```dotenv
STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_replace_me
NEXTAUTH_URL=http://localhost:3000
```

Use matching test publishable/secret keys locally and matching live keys only in production. The
publishable key is safe for the browser; the secret key and webhook secret must remain server-only.
The webhook signing secret is different for each Stripe endpoint and differs between test and live
mode.

`NEXTAUTH_URL` must be the public HTTPS origin in production because it is used to create Stripe
success and cancellation URLs.

## Stripe account eligibility

Stripe can accept cardholders from many countries, but the merchant account itself must belong to
a business in a country or region supported by Stripe. As of this documentation update, Lebanon
is not listed on Stripe's merchant availability page. Do not register a Stripe account with a
fabricated address. Before production, confirm that the legal entity receiving funds is eligible,
or replace Stripe with a payment provider that supports the business entity.

- [Stripe global availability](https://stripe.com/global)
- [Stripe supported currencies](https://docs.stripe.com/currencies)

## Webhook configuration

Create a Stripe webhook destination pointing to:

```text
https://your-production-domain.example/api/v1/webhooks/stripe
```

Subscribe only to these implemented events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `refund.updated`

The route reads the raw request body and validates `Stripe-Signature` with the official Stripe
SDK and a five-minute replay tolerance. Do not add JSON body parsing before signature
verification.

Stripe does not guarantee event order and can deliver an event more than once. Payment updates
therefore use guarded status transitions, and event IDs are recorded after successful processing.

## Local webhook testing

Install and authenticate the Stripe CLI, then run:

```bash
stripe listen \
  --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,checkout.session.expired,payment_intent.succeeded,payment_intent.payment_failed,charge.refunded,refund.updated \
  --forward-to localhost:3000/api/v1/webhooks/stripe
```

Copy the displayed `whsec_...` value into `.env.local` as `STRIPE_WEBHOOK_SECRET`, restart the
development server, enter the Visa in reservation Step 3, approve the reservation, and open **Pay
securely** from My bookings.

Stripe test card:

```text
4242 4242 4242 4242
Any future expiry
Any three-digit CVC
Any valid postal code
```

Verify all three records after payment:

1. Stripe Dashboard shows a successful test payment.
2. `payments.status` is `PAID` and `amountPaid` matches the reservation total.
3. `bookings.paymentStatus` is `paid`.

## Status model

Payment ledger statuses:

- `UNPAID`
- `PENDING`
- `PARTIALLY_PAID`
- `PAID`
- `FAILED`
- `REFUND_PENDING`
- `REFUNDED`

Booking payment statuses use the lowercase equivalents. A full refund changes the booking payment
status to `refunded` and cancels the reservation. While a refund is pending, the approved
reservation continues to hold its dates. A failed refund returns the payment to `paid`.

## Offline reconciliation

Cash/Whish reservations are not sent to Stripe. An administrator records:

- unpaid;
- partially paid, with the amount received;
- paid in full; or
- refunded.

The server rejects partial amounts that are zero, equal to the total, or greater than the total.
Use **Paid in full** when the entire balance has been received. Store a receipt or reconciliation
reference in the optional note field; do not store full card or bank credentials.

## Refunds

The admin reservation panel can issue a full refund for a completed Stripe card payment. The
request uses a stable attempt-based idempotency key. Boardly keeps the reservation approved while
Stripe reports a pending refund and cancels it only after successful confirmation.

Partial refunds created directly in Stripe are synchronized by the `charge.refunded` webhook and
leave the reservation active with a partially-paid balance. Review such cases operationally.

## Failure recovery

- **Checkout will not open:** confirm the reservation is approved, uses card payment, and has not
  already been paid or refunded.
- **Visa fields do not open:** confirm both the secret and publishable Stripe keys are configured,
  belong to the same Stripe mode, and restart the server.
- **Success page remains pending:** inspect the webhook delivery, then use **Check again**. The
  page retrieves the Checkout Session server-side and can reconcile a successful payment.
- **Webhook returns 400:** inspect the Stripe delivery log. Signature failures usually mean the
  wrong endpoint secret; other failures are retried by Stripe.
- **Duplicate webhook:** expected and safe. The event ledger prevents duplicate fulfillment.
- **Refund failed:** the payment returns to `PAID`; the reservation is not released.

Never ask an advertiser to pay again until My bookings and the Stripe Dashboard have both been
checked.

## Production checklist

- [ ] Eligible Stripe merchant entity confirmed
- [ ] Live secret key stored in the production secret manager
- [ ] Live publishable key configured as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Live webhook endpoint created with only the required events
- [ ] Live webhook secret stored separately from the test secret
- [ ] `NEXTAUTH_URL` is the canonical HTTPS origin
- [ ] Test payment, cancellation, failure, duplicate webhook, and refund completed
- [ ] MongoDB unique indexes for payment session, intent, refund, and event IDs are present
- [ ] Stripe Dashboard access is restricted and protected by multi-factor authentication
- [ ] Finance owns offline reconciliation and refund procedures
- [ ] Monitoring alerts on repeated webhook failures

Official implementation references:

- [Stripe Checkout fulfillment](https://docs.stripe.com/checkout/fulfillment)
- [Stripe webhook security and retries](https://docs.stripe.com/webhooks)
- [Stripe Checkout lifecycle](https://docs.stripe.com/payments/checkout/how-checkout-works)
- [Stripe SetupIntents](https://docs.stripe.com/payments/setup-intents)
