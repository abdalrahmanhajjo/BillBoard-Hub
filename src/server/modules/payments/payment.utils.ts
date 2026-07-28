import type { PaymentDocument } from '@/server/modules/payments/payment.model';
import type { Payment } from '@/shared/types/payment';
import { PAYMENT_METHODS, PAYMENT_PROVIDERS, PAYMENT_STATUSES } from '@/shared/constants/payment';

function optionalIso(value: Date | undefined): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}

export function toPayment(document: PaymentDocument): Payment {
  const status = document.status ?? PAYMENT_STATUSES.PENDING;
  return {
    id: String(document._id),
    bookingId: String(document.bookingId),
    advertiserId: String(document.advertiserId),
    provider:
      document.provider ??
      (document.stripeSessionId ? PAYMENT_PROVIDERS.STRIPE : PAYMENT_PROVIDERS.MANUAL),
    stripeSessionId: document.stripeSessionId ?? undefined,
    stripePaymentIntentId: document.stripePaymentIntentId ?? undefined,
    stripeRefundId: document.stripeRefundId ?? undefined,
    amount: document.amount,
    amountPaid: document.amountPaid ?? (status === PAYMENT_STATUSES.PAID ? document.amount : 0),
    currency: document.currency,
    status,
    paymentMethod: document.paymentMethod ?? PAYMENT_METHODS.CARD,
    checkoutAttempt: document.checkoutAttempt ?? 0,
    refundAttempt: document.refundAttempt ?? 0,
    note: document.note ?? undefined,
    recordedBy: document.recordedBy ? String(document.recordedBy) : undefined,
    expiresAt: optionalIso(document.expiresAt),
    paidAt: optionalIso(document.paidAt),
    refundedAt: optionalIso(document.refundedAt),
    createdAt: optionalIso(document.createdAt),
    updatedAt: optionalIso(document.updatedAt),
  };
}
