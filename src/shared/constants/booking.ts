export const BOOKING_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_METHODS = {
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  E_WALLET: 'e_wallet',
  CASH: 'cash',
} as const;

export const CAMPAIGN_OBJECTIVES = {
  AWARENESS: 'awareness',
  PRODUCT_LAUNCH: 'product_launch',
  STORE_VISITS: 'store_visits',
  ENGAGEMENT: 'engagement',
} as const;

export const BOOKING_CURRENCIES = ['USD', 'EUR', 'LBP'] as const;

/**
 * Statuses that occupy a billboard's calendar for conflict detection. Only
 * *approved* reservations block future bookings — pending requests do not, so
 * multiple advertisers may request the same dates until an admin approves one.
 */
export const BLOCKING_BOOKING_STATUSES = [BOOKING_STATUSES.APPROVED] as const;

// Pricing rates for the reservation quote. Centralized so finance can tune them.
export const BOOKING_SERVICE_FEE_RATE = 0.055;
export const BOOKING_VAT_RATE = 0.11;
export const BOOKING_DAYS_PER_MONTH = 30;

/**
 * How many reservations may run on a billboard on the same day. A static
 * billboard shows one creative at a time (exclusive), while a digital screen
 * rotates several ads, so it accepts up to a daily capacity.
 */
export const STATIC_RESERVATION_DAILY_LIMIT = 1;
export const DIGITAL_RESERVATION_DAILY_LIMIT = 6;
