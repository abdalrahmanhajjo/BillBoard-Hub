import type { BookingPricing } from '@/shared/pricing/booking-pricing';
import type {
  BookingBilling,
  BookingCompany,
  BookingCurrency,
  BookingInvoice,
  BookingStatus,
  CampaignObjective,
  PaymentMethod,
  PaymentStatus,
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
  paymentStatus: PaymentStatus;
  invoice: BookingInvoice;
  pricing: BookingPricing & { currency: BookingCurrency };
  status: BookingStatus;
};

export type BookingFilter = {
  advertiserId?: string;
  billboardId?: string;
  status?: BookingStatus;
};
