import { describe, expect, it } from 'vitest';
import {
  monthOverMonth,
  percentChange,
  recentBookings,
  spendByMonth,
  statusBreakdown,
  totalCommitted,
  upcomingBookings,
} from '@/client/features/dashboard/utils/advertiser-insights';
import type { Booking, BookingStatus } from '@/shared/types/booking';

function booking(overrides: Partial<Booking> & { id: string }): Booking {
  return {
    reference: `BR-${overrides.id}`,
    billboardId: 'bb-1',
    advertiserId: 'adv-1',
    campaignName: 'Campaign',
    objective: 'awareness',
    startDate: '2026-06-10',
    endDate: '2026-06-20',
    billing: { contactName: 'A', email: 'a@example.com', phone: '1' },
    company: { name: 'Co', address: 'Street', country: 'Lebanon' },
    paymentMethod: 'card',
    paymentStatus: 'pending',
    invoice: { currency: 'USD', email: 'a@example.com' },
    pricing: { subtotal: 100, serviceFee: 0, vat: 0, total: 100, days: 10, currency: 'USD' },
    status: 'approved' as BookingStatus,
    ...overrides,
  } as Booking;
}

const NOW = new Date('2026-06-15T00:00:00Z');

describe('spendByMonth', () => {
  it('fills months with no activity instead of skipping them', () => {
    const points = spendByMonth([booking({ id: '1' })], { back: 2, forward: 0, now: NOW });

    expect(points.map((point) => point.month)).toEqual(['2026-04', '2026-05', '2026-06']);
    expect(points.map((point) => point.spend)).toEqual([0, 0, 100]);
  });

  // Outdoor campaigns are reserved months ahead: a backward-only window would
  // report zero committed spend next to a non-zero outstanding balance.
  it('includes reservations booked for future months', () => {
    const points = spendByMonth([booking({ id: 'ahead', startDate: '2027-01-12' })], {
      back: 2,
      forward: 9,
      now: NOW,
    });

    expect(points.find((point) => point.month === '2027-01')).toMatchObject({
      spend: 100,
      reservations: 1,
    });
  });

  it('excludes cancelled and rejected reservations from committed spend', () => {
    const points = spendByMonth(
      [
        booking({ id: '1', status: 'approved' }),
        booking({ id: '2', status: 'cancelled' }),
        booking({ id: '3', status: 'rejected' }),
      ],
      { back: 0, forward: 0, now: NOW },
    );

    expect(points.at(-1)).toMatchObject({ spend: 100, reservations: 1 });
  });

  it('ignores reservations outside the requested window', () => {
    const points = spendByMonth([booking({ id: '1', startDate: '2020-01-05' })], {
      back: 2,
      forward: 0,
      now: NOW,
    });

    expect(points.every((point) => point.spend === 0)).toBe(true);
  });
});

describe('totalCommitted', () => {
  it('sums every reservation that has not been refused, whenever it runs', () => {
    expect(
      totalCommitted([
        booking({ id: '1', startDate: '2020-01-01' }),
        booking({ id: '2', startDate: '2030-01-01' }),
        booking({ id: '3', status: 'cancelled' }),
        booking({ id: '4', status: 'rejected' }),
      ]),
    ).toBe(200);
  });
});

describe('percentChange', () => {
  it('returns null from a zero baseline rather than an infinite gain', () => {
    expect(percentChange(500, 0)).toBeNull();
  });

  it('computes signed change', () => {
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(50, 100)).toBe(-50);
    expect(percentChange(100, 100)).toBe(0);
  });
});

describe('monthOverMonth', () => {
  it('compares the current month against the previous one', () => {
    const points = spendByMonth(
      [
        booking({ id: '1', startDate: '2026-05-02' }),
        booking({ id: '2', startDate: '2026-06-02' }),
        booking({ id: '3', startDate: '2026-06-03' }),
      ],
      { back: 2, forward: 6, now: NOW },
    );

    expect(monthOverMonth(points, NOW)).toEqual({ spend: 100, reservations: 100 });
  });

  // The window runs into the future, so position-based comparison would read
  // two upcoming months instead of recent history.
  it('is not confused by future buckets after the current month', () => {
    const points = spendByMonth(
      [
        booking({ id: 'past', startDate: '2026-05-02' }),
        booking({ id: 'now', startDate: '2026-06-02' }),
        booking({ id: 'future', startDate: '2026-11-02' }),
      ],
      { back: 2, forward: 9, now: NOW },
    );

    expect(monthOverMonth(points, NOW).spend).toBe(0);
  });

  it('reports no trend when there is not enough history', () => {
    expect(monthOverMonth([], NOW)).toEqual({ spend: null, reservations: null });
  });
});

describe('statusBreakdown', () => {
  it('counts each status, most common first', () => {
    const slices = statusBreakdown([
      booking({ id: '1', status: 'pending' }),
      booking({ id: '2', status: 'approved' }),
      booking({ id: '3', status: 'approved' }),
    ]);

    expect(slices).toEqual([
      { status: 'approved', label: 'Approved', count: 2 },
      { status: 'pending', label: 'Pending', count: 1 },
    ]);
  });
});

describe('upcomingBookings', () => {
  it('drops finished and cancelled runs and sorts by start date', () => {
    const result = upcomingBookings(
      [
        booking({ id: 'past', startDate: '2026-01-01', endDate: '2026-01-10' }),
        booking({ id: 'later', startDate: '2026-08-01', endDate: '2026-08-10' }),
        booking({ id: 'soon', startDate: '2026-06-20', endDate: '2026-06-30' }),
        booking({ id: 'off', startDate: '2026-07-01', endDate: '2026-07-10', status: 'cancelled' }),
      ],
      10,
      NOW,
    );

    expect(result.map((item) => item.id)).toEqual(['soon', 'later']);
  });

  it('keeps a run that is currently live', () => {
    const result = upcomingBookings(
      [booking({ id: 'live', startDate: '2026-06-01', endDate: '2026-06-30' })],
      10,
      NOW,
    );

    expect(result).toHaveLength(1);
  });
});

describe('recentBookings', () => {
  it('orders by creation time, newest first', () => {
    const result = recentBookings([
      booking({ id: 'old', createdAt: '2026-01-01T00:00:00Z' }),
      booking({ id: 'new', createdAt: '2026-06-01T00:00:00Z' }),
    ]);

    expect(result.map((item) => item.id)).toEqual(['new', 'old']);
  });
});
