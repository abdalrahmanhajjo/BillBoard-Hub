import type { BookingPricing } from '@/shared/pricing/booking-pricing';
import type {
  BookingBilling,
  BookingCompany,
  BookingCreativeType,
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
  creativeType?: BookingCreativeType;
  creativeDurationSeconds?: number;
  billing: BookingBilling;
  company: BookingCompany;
  paymentMethod: PaymentMethod;
  stripeCustomerId?: string;
  stripeSetupIntentId?: string;
  stripePaymentMethodId?: string;
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

/** One row per advertiser out of `bookingRepository.aggregateAdvertiserActivity`. */
export type AdvertiserBookingActivityRow = {
  /** The advertiser id the reservations belong to. */
  _id: string;
  total: number;
  pending: number;
  active: number;
  lastBookingAt: Date | null;
  companyName: string | null;
  country: string | null;
  phone: string | null;
  spend: Array<{ currency: string; amount: number }>;
  outstanding: Array<{ currency: string; amount: number }>;
};
