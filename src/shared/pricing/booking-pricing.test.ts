import { describe, expect, it } from 'vitest';
import { computeBookingPricing, inclusiveDays } from '@/shared/pricing/booking-pricing';
import {
  BOOKING_DAYS_PER_MONTH,
  BOOKING_SERVICE_FEE_RATE,
  BOOKING_VAT_RATE,
} from '@/shared/constants/booking';

describe('inclusiveDays', () => {
  it('counts both endpoints', () => {
    expect(inclusiveDays('2026-06-15', '2026-06-28')).toBe(14);
  });

  it('treats a single day as one day, not zero', () => {
    expect(inclusiveDays('2026-06-15', '2026-06-15')).toBe(1);
  });

  it('spans month and year boundaries', () => {
    expect(inclusiveDays('2026-01-30', '2026-02-02')).toBe(4);
    expect(inclusiveDays('2026-12-31', '2027-01-01')).toBe(2);
  });

  // A reversed or unparseable range must not produce a chargeable day count.
  it('returns 0 when the range is reversed or invalid', () => {
    expect(inclusiveDays('2026-06-28', '2026-06-15')).toBe(0);
    expect(inclusiveDays('not-a-date', '2026-06-15')).toBe(0);
    expect(inclusiveDays('2026-06-15', '')).toBe(0);
  });

  it('handles a leap day', () => {
    expect(inclusiveDays('2028-02-28', '2028-03-01')).toBe(3);
  });
});

describe('computeBookingPricing', () => {
  it('derives the daily rate from the monthly price', () => {
    const pricing = computeBookingPricing(3000, 30);

    expect(pricing.dailyRate).toBe(100);
    expect(pricing.subtotal).toBe(3000);
  });

  it('applies the service fee to the subtotal and VAT to both', () => {
    const pricing = computeBookingPricing(3000, 30);

    // 3000 + 5.5% = 3165, VAT 11% of 3165 = 348.15
    expect(pricing.serviceFee).toBe(165);
    expect(pricing.vat).toBe(348.15);
    expect(pricing.total).toBe(3513.15);
  });

  it('keeps every money figure at two decimals', () => {
    const pricing = computeBookingPricing(4999, 17);

    for (const amount of [
      pricing.dailyRate,
      pricing.subtotal,
      pricing.serviceFee,
      pricing.vat,
      pricing.total,
    ]) {
      expect(Number.isFinite(amount)).toBe(true);
      expect(Math.round(amount * 100)).toBeCloseTo(amount * 100, 6);
    }
  });

  it('totals equal the sum of their parts', () => {
    for (const [monthly, days] of [
      [3000, 30],
      [4999, 17],
      [1234.56, 3],
      [899, 1],
    ] as const) {
      const pricing = computeBookingPricing(monthly, days);
      const recomputed =
        Math.round((pricing.subtotal + pricing.serviceFee + pricing.vat) * 100) / 100;

      expect(pricing.total).toBe(recomputed);
    }
  });

  // Guards against a negative or fractional day count becoming a negative
  // charge or a fractional-day bill.
  it('floors days at zero and never charges for a negative range', () => {
    const negative = computeBookingPricing(3000, -5);

    expect(negative.days).toBe(0);
    expect(negative.subtotal).toBe(0);
    expect(negative.total).toBe(0);
  });

  it('truncates fractional days rather than pro-rating', () => {
    expect(computeBookingPricing(3000, 2.9).days).toBe(2);
  });

  it('charges nothing when the billboard is free', () => {
    const pricing = computeBookingPricing(0, 10);

    expect(pricing.subtotal).toBe(0);
    expect(pricing.total).toBe(0);
  });

  it('scales linearly with days', () => {
    const one = computeBookingPricing(3000, 1);
    const ten = computeBookingPricing(3000, 10);

    expect(ten.subtotal).toBeCloseTo(one.subtotal * 10, 2);
  });

  it('matches the configured rate constants', () => {
    const days = 30;
    const monthly = 3000;
    const pricing = computeBookingPricing(monthly, days);

    const expectedSubtotal = (monthly / BOOKING_DAYS_PER_MONTH) * days;
    expect(pricing.subtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(pricing.serviceFee).toBeCloseTo(expectedSubtotal * BOOKING_SERVICE_FEE_RATE, 2);
    expect(pricing.vat).toBeCloseTo(
      (expectedSubtotal + expectedSubtotal * BOOKING_SERVICE_FEE_RATE) * BOOKING_VAT_RATE,
      2,
    );
  });
});
