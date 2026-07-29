import type { ApiResponse } from './response';

/**
 * Reservations each carry their own invoice currency, so money is reported per
 * currency rather than summed into a single misleading figure.
 */
export type CurrencyTotal = {
  currency: string;
  amount: number;
};

export type AdvertiserDirectoryEntry = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  /** ISO timestamp of account creation; null on records predating timestamps. */
  joinedAt: string | null;
  /**
   * From the advertiser's own profile where one exists, falling back to their
   * most recent reservation for accounts created before profiles existed.
   */
  companyName: string | null;
  phone: string | null;
  /** Profile-only; reservations carry a country rather than a full address. */
  address: string | null;
  country: string | null;
  campaigns: {
    total: number;
    active: number;
  };
  bookings: {
    total: number;
    pending: number;
    /** Approved and not yet finished — what is running right now. */
    active: number;
  };
  /** Recognized revenue: approved and completed reservations. */
  spend: CurrencyTotal[];
  /** Reservations still owing money. */
  outstanding: CurrencyTotal[];
  /** Most recent reservation or campaign timestamp, whichever is later. */
  lastActivityAt: string | null;
};

export type AdvertiserDirectorySummary = {
  total: number;
  active: number;
  inactive: number;
  /** Advertisers who have submitted at least one reservation. */
  engaged: number;
  spend: CurrencyTotal[];
};

export type AdvertiserDirectory = {
  advertisers: AdvertiserDirectoryEntry[];
  summary: AdvertiserDirectorySummary;
};

export type AdvertiserDirectoryResponse = ApiResponse<{ directory: AdvertiserDirectory }>;
