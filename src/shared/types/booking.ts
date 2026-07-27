import { BOOKING_STATUSES } from '@/shared/constants/booking';
import { BOOKING_PAYMENT_STATUSES } from '@/shared/constants/booking';
import type { Currency } from '@/shared/types/currency';
import { PaymentMethod } from '@/shared/types/payment';
import type { CampaignObjective } from '@/shared/types/campian';
import type { BookingPricing } from '@/shared/pricing/booking-pricing';

export type BookingStatus = (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];
export type BookingPaymentStatus =
  (typeof BOOKING_PAYMENT_STATUSES)[keyof typeof BOOKING_PAYMENT_STATUSES];
export type BookingCurrency = Currency;
export type { CampaignObjective };
export type { PaymentMethod };

export type BookingBilling = {
  contactName: string;
  email: string;
  phone: string;
  vatNumber?: string;
};

export type BookingCompany = {
  name: string;
  commercialRegister?: string;
  address: string;
  country: string;
};

export type BookingInvoice = {
  currency: Currency;
  email: string;
  poNumber?: string;
};

export type Booking = {
  id: string;
  reference: string;
  billboardId: string;
  advertiserId: string;
  campaignName: string;
  objective: CampaignObjective;
  targetAudience?: string;
  brief?: string;
  notes?: string;
  /** Inclusive campaign window, ISO date strings (YYYY-MM-DD). */
  startDate: string;
  endDate: string;
  creativeUrl?: string;
  billing: BookingBilling;
  company: BookingCompany;
  paymentMethod: PaymentMethod;
  invoice: BookingInvoice;
  pricing: BookingPricing & { currency: Currency };
  status: BookingStatus;
  paymentStatus?: BookingPaymentStatus;
  createdAt?: string;
  updatedAt?: string;
};
