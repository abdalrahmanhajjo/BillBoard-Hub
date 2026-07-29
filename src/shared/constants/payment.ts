/**
 * Payment lifecycle statuses tracked on the `Payment` record (distinct from the
 * booking's own `paymentStatus` in `@/shared/constants/booking`). These mirror
 * the Stripe checkout/payment-intent lifecycle.
 */
export const PAYMENT_STATUSES = {
  UNPAID: 'UNPAID',
  PENDING: 'PENDING',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUND_PENDING: 'REFUND_PENDING',
  REFUNDED: 'REFUNDED',
} as const;

export const PAYMENT_PROVIDERS = {
  STRIPE: 'stripe',
  MANUAL: 'manual',
} as const;

export const PAYMENT_METHODS = {
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  E_WALLET: 'e_wallet',
  CASH: 'cash',
} as const;

export const STRIPE_CHECKOUT_TTL_SECONDS = 30 * 60;
