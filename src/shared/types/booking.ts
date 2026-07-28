import {
  BOOKING_CURRENCIES,
  BOOKING_STATUSES,
  CAMPAIGN_OBJECTIVES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
} from '@/shared/constants/booking';
import type { BookingPricing } from '@/shared/pricing/booking-pricing';

export type BookingStatus = (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];
export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];
export type CampaignObjective = (typeof CAMPAIGN_OBJECTIVES)[keyof typeof CAMPAIGN_OBJECTIVES];
export type BookingCurrency = (typeof BOOKING_CURRENCIES)[number];

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
  currency: BookingCurrency;
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
  paymentStatus: PaymentStatus;
  invoice: BookingInvoice;
  pricing: BookingPricing & { currency: BookingCurrency };
  status: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
};
