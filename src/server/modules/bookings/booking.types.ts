import type { BookingPricing } from '@/shared/pricing/booking-pricing';
import type {
  BookingBilling,
  BookingCompany,
  BookingCurrency,
  BookingPaymentStatus,
  BookingInvoice,
  BookingStatus,
  CampaignObjective,
  PaymentMethod,
} from '@/shared/types/booking';

export type BookingRecord = {
  billboardId: string;
  advertiserId: string;
  campaignName: string;
  objective: CampaignObjective;
  targetAudience?: string;
  brief?: string;
  notes?: string;
  startDate: Date;
  endDate: Date;
  creativeUrl?: string;
  billing: BookingBilling;
  company: BookingCompany;
  paymentMethod: PaymentMethod;
  invoice: BookingInvoice;
  pricing: BookingPricing & { currency: BookingCurrency };
  status: BookingStatus;
  paymentStatus: BookingPaymentStatus;
};

export type BookingFilter = {
  advertiserId?: string;
  billboardId?: string;
  status?: BookingStatus;
};
