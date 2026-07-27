import { CURRENCIES } from './currencies';
import { CAMPAIGN_OBJECTIVES } from './campain';

export const BOOKING_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CONFIRMED: 'CONFIRMED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const BOOKING_PAYMENT_STATUSES = {
  UNPAID: 'UNPAID',
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
} as const;

export const PAYMENT_METHODS = {
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  E_WALLET: 'e_wallet',
  CASH: 'cash',
} as const;

export const BOOKING_CURRENCIES = Object.values(CURRENCIES).map((currency) => currency.code);
export { CAMPAIGN_OBJECTIVES };

export const BLOCKING_BOOKING_STATUSES = [
  BOOKING_STATUSES.APPROVED,
  BOOKING_STATUSES.CONFIRMED,
  BOOKING_STATUSES.ACTIVE,
] as const;

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
