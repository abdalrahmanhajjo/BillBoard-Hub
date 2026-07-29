import { describe, expect, it } from 'vitest';
import {
  inclusiveDayCount,
  monthBuckets,
  monthlyEquivalent,
  netProfit,
  occupancyRate,
  overlapDays,
  profitMargin,
  round2,
  toBaseAmount,
} from '@/shared/finance/finance-math';
import { EXPENSE_RECURRENCES } from '@/shared/constants/finance';

describe('toBaseAmount', () => {
  it('passes base-currency amounts through at a 1:1 rate', () => {
    expect(toBaseAmount(800, 'USD')).toEqual({ baseAmount: 800, exchangeRate: 1 });
  });

  it('converts a foreign amount with the supplied rate', () => {
    expect(toBaseAmount(1_000_000, 'LBP', 0.000011)).toEqual({
      baseAmount: 11,
      exchangeRate: 0.000011,
    });
  });

  // A silent 1:1 default would book 1,000,000 LBP as $1,000,000 and destroy
  // every total that includes it.
  it('refuses a foreign amount with no rate rather than assuming 1:1', () => {
    expect(() => toBaseAmount(1_000_000, 'LBP')).toThrow(/exchange rate/i);
    expect(() => toBaseAmount(100, 'EUR', 0)).toThrow(/exchange rate/i);
    expect(() => toBaseAmount(100, 'EUR', -2)).toThrow(/exchange rate/i);
  });
});

describe('monthlyEquivalent', () => {
  it('spreads recurring costs across the months they cover', () => {
    expect(monthlyEquivalent(1200, EXPENSE_RECURRENCES.YEARLY)).toBe(100);
    expect(monthlyEquivalent(300, EXPENSE_RECURRENCES.QUARTERLY)).toBe(100);
    expect(monthlyEquivalent(800, EXPENSE_RECURRENCES.MONTHLY)).toBe(800);
  });

  it('treats a one-off as no recurring cost', () => {
    expect(monthlyEquivalent(500, EXPENSE_RECURRENCES.ONE_OFF)).toBe(0);
  });
});

describe('netProfit and profitMargin', () => {
  it('computes the worked example from the brief', () => {
    const revenue = 4000;
    const expenses = 1000 + 150 + 100;

    expect(netProfit(revenue, expenses)).toBe(2750);
    expect(profitMargin(2750, revenue)).toBe(68.75);
  });

  it('reports a loss as a negative number', () => {
    expect(netProfit(500, 900)).toBe(-400);
    expect(profitMargin(-400, 500)).toBe(-80);
  });

  // "No revenue" is not "0% margin" — dividing would render Infinity or NaN.
  it('returns null margin when there is no revenue', () => {
    expect(profitMargin(-250, 0)).toBeNull();
  });
});

describe('occupancyRate', () => {
  it('is the share of window days that are booked', () => {
    expect(occupancyRate(15, 30)).toBe(0.5);
  });

  // Digital screens rotate several ads at once, so booked days can exceed the
  // window; utilisation still cannot exceed 100%.
  it('clamps overlapping digital rotations to 100%', () => {
    expect(occupancyRate(90, 30)).toBe(1);
  });

  it('is zero for an empty window', () => {
    expect(occupancyRate(10, 0)).toBe(0);
  });
});

describe('overlapDays', () => {
  const windowStart = new Date('2026-06-01T00:00:00Z');
  const windowEnd = new Date('2026-06-30T00:00:00Z');

  it('counts only the days inside the window', () => {
    expect(
      overlapDays(
        new Date('2026-05-20T00:00:00Z'),
        new Date('2026-06-05T00:00:00Z'),
        windowStart,
        windowEnd,
      ),
    ).toBe(5);
  });

  it('counts a fully contained booking inclusively', () => {
    expect(
      overlapDays(
        new Date('2026-06-10T00:00:00Z'),
        new Date('2026-06-19T00:00:00Z'),
        windowStart,
        windowEnd,
      ),
    ).toBe(10);
  });

  it('is zero when the booking is outside the window', () => {
    expect(
      overlapDays(
        new Date('2026-07-01T00:00:00Z'),
        new Date('2026-07-10T00:00:00Z'),
        windowStart,
        windowEnd,
      ),
    ).toBe(0);
  });
});

describe('inclusiveDayCount', () => {
  it('counts both endpoints', () => {
    expect(
      inclusiveDayCount(new Date('2026-06-01T00:00:00Z'), new Date('2026-06-30T00:00:00Z')),
    ).toBe(30);
  });

  it('is zero for an inverted range', () => {
    expect(
      inclusiveDayCount(new Date('2026-06-30T00:00:00Z'), new Date('2026-06-01T00:00:00Z')),
    ).toBe(0);
  });
});

describe('monthBuckets', () => {
  it('covers every month in the window, oldest first', () => {
    const buckets = monthBuckets(
      new Date('2026-04-15T00:00:00Z'),
      new Date('2026-07-02T00:00:00Z'),
    );

    expect(buckets.map((bucket) => bucket.month)).toEqual([
      '2026-04',
      '2026-05',
      '2026-06',
      '2026-07',
    ]);
  });

  it('handles a window inside one month', () => {
    const buckets = monthBuckets(
      new Date('2026-06-02T00:00:00Z'),
      new Date('2026-06-20T00:00:00Z'),
    );

    expect(buckets).toHaveLength(1);
  });
});

describe('round2', () => {
  it('keeps money at cent precision', () => {
    expect(round2(0.1 + 0.2)).toBe(0.3);
    expect(round2(1234.5678)).toBe(1234.57);
  });
});
