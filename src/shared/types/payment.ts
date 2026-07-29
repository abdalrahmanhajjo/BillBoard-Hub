import { PAYMENT_METHODS, PAYMENT_PROVIDERS, PAYMENT_STATUSES } from '@/shared/constants/payment';
import type { Currency } from '@/shared/types/currency';

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];
export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[keyof typeof PAYMENT_PROVIDERS];

export type PaymentCurrency = Currency;

export type Payment = {
  id: string;
  bookingId: string;
  advertiserId: string;
  provider: PaymentProvider;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeRefundId?: string;
  amount: number;
  amountPaid: number;
  currency: PaymentCurrency;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  checkoutAttempt: number;
  refundAttempt: number;
  note?: string;
  recordedBy?: string;
  expiresAt?: string;
  paidAt?: string;
  refundedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CheckoutVerification = {
  payment: Payment;
  booking: {
    id: string;
    reference: string;
    campaignName: string;
    paymentStatus: import('@/shared/types/booking').PaymentStatus;
  };
};
