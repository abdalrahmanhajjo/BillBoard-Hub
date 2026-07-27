import {
  BOOKING_DAYS_PER_MONTH,
  BOOKING_SERVICE_FEE_RATE,
  BOOKING_VAT_RATE,
} from '@/shared/constants/booking';

const MS_PER_DAY = 86_400_000;

export type BookingPricing = {
  days: number;
  dailyRate: number;
  subtotal: number;
  serviceFee: number;
  vat: number;
  total: number;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Inclusive day count between two ISO dates (Jun 15 → Jun 28 = 14 days). */
export function inclusiveDays(startDate: string, endDate: string): number {
  const start = Date.parse(startDate);
  const end = Date.parse(endDate);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return 0;
  }
  return Math.floor((end - start) / MS_PER_DAY) + 1;
}

/**
 * Derives the reservation quote from a billboard's monthly price and the
 * campaign length. Used by the client for a live preview and by the server as
 * the authoritative amount — the client-sent total is never trusted.
 */
export function computeBookingPricing(monthlyPrice: number, days: number): BookingPricing {
  const safeDays = Math.max(0, Math.floor(days));
  const dailyRate = monthlyPrice / BOOKING_DAYS_PER_MONTH;
  const subtotal = round2(dailyRate * safeDays);
  const serviceFee = round2(subtotal * BOOKING_SERVICE_FEE_RATE);
  const vat = round2((subtotal + serviceFee) * BOOKING_VAT_RATE);
  const total = round2(subtotal + serviceFee + vat);
  return {
    days: safeDays,
    dailyRate: round2(dailyRate),
    subtotal,
    serviceFee,
    vat,
    total,
  };
}
