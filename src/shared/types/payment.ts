import { PAYMENT_METHODS, PAYMENT_STATUSES } from '@/shared/constants/payment';
import type { Currency } from '@/shared/types/currency';

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];
export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export type PaymentCurrency = Currency;

export type Payment = {
  id: string;
  bookingId: string;
  advertiserId: string;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: PaymentCurrency;
  status: PaymentStatus;
  paymentMethod?: string;
  paidAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};
