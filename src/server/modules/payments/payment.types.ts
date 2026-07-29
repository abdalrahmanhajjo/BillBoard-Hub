import type { PaymentMethod, PaymentProvider, PaymentStatus } from '@/shared/types/payment';
import type { Currency } from '@/shared/types/currency';

export type PaymentRecord = {
  bookingId: string;
  advertiserId: string;
  provider: PaymentProvider;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeRefundId?: string;
  amount: number;
  amountPaid: number;
  currency: Currency;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  checkoutAttempt: number;
  refundAttempt: number;
  note?: string;
  recordedBy?: string;
  expiresAt?: Date;
  paidAt?: Date;
  refundedAt?: Date;
};
