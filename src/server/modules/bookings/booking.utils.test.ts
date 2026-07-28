import { describe, expect, it } from 'vitest';
import {
  maxConcurrentReservations,
  reservationLimitFor,
} from '@/server/modules/bookings/booking.utils';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import {
  DIGITAL_RESERVATION_DAILY_LIMIT,
  STATIC_RESERVATION_DAILY_LIMIT,
} from '@/shared/constants/booking';

function range(start: string, end: string) {
  return { startDate: new Date(start), endDate: new Date(end) };
}

const WINDOW_START = new Date('2026-06-10');
const WINDOW_END = new Date('2026-06-20');

describe('reservationLimitFor', () => {
  it('lets a digital screen rotate more reservations than a static board', () => {
    expect(reservationLimitFor(BILLBOARD_TYPES.STATIC)).toBe(STATIC_RESERVATION_DAILY_LIMIT);
    expect(reservationLimitFor(BILLBOARD_TYPES.DIGITAL)).toBe(DIGITAL_RESERVATION_DAILY_LIMIT);
    expect(reservationLimitFor(BILLBOARD_TYPES.DIGITAL)).toBeGreaterThan(
      reservationLimitFor(BILLBOARD_TYPES.STATIC),
    );
  });
});

describe('maxConcurrentReservations', () => {
  it('is zero when nothing is booked', () => {
    expect(maxConcurrentReservations([], WINDOW_START, WINDOW_END)).toBe(0);
  });

  it('counts a single reservation once', () => {
    const peak = maxConcurrentReservations(
      [range('2026-06-12', '2026-06-15')],
      WINDOW_START,
      WINDOW_END,
    );

    expect(peak).toBe(1);
  });

  it('counts reservations sharing a day as concurrent', () => {
    const peak = maxConcurrentReservations(
      [range('2026-06-12', '2026-06-15'), range('2026-06-15', '2026-06-18')],
      WINDOW_START,
      WINDOW_END,
    );

    expect(peak).toBe(2);
  });

  // The boundary that decides double-booking: one ends the day before the next
  // begins, so the board is never held twice.
  it('does not count back-to-back reservations as overlapping', () => {
    const peak = maxConcurrentReservations(
      [range('2026-06-12', '2026-06-14'), range('2026-06-15', '2026-06-18')],
      WINDOW_START,
      WINDOW_END,
    );

    expect(peak).toBe(1);
  });

  it('reports the peak, not the total', () => {
    const peak = maxConcurrentReservations(
      [
        range('2026-06-11', '2026-06-12'),
        range('2026-06-14', '2026-06-16'),
        range('2026-06-15', '2026-06-17'),
        range('2026-06-19', '2026-06-20'),
      ],
      WINDOW_START,
      WINDOW_END,
    );

    expect(peak).toBe(2);
  });

  it('ignores reservations entirely outside the window', () => {
    const peak = maxConcurrentReservations(
      [range('2026-05-01', '2026-05-10'), range('2026-07-01', '2026-07-10')],
      WINDOW_START,
      WINDOW_END,
    );

    expect(peak).toBe(0);
  });

  it('clamps reservations that straddle the window edges', () => {
    const peak = maxConcurrentReservations(
      [range('2026-06-01', '2026-06-11'), range('2026-06-19', '2026-06-30')],
      WINDOW_START,
      WINDOW_END,
    );

    expect(peak).toBe(1);
  });

  it('counts a reservation that spans the whole window', () => {
    const peak = maxConcurrentReservations(
      [range('2026-01-01', '2026-12-31'), range('2026-06-15', '2026-06-16')],
      WINDOW_START,
      WINDOW_END,
    );

    expect(peak).toBe(2);
  });

  it('counts identical reservations separately', () => {
    const identical = range('2026-06-12', '2026-06-15');
    const peak = maxConcurrentReservations(
      [identical, identical, identical],
      WINDOW_START,
      WINDOW_END,
    );

    expect(peak).toBe(3);
  });

  it('handles a single-day reservation at the window edge', () => {
    expect(
      maxConcurrentReservations([range('2026-06-20', '2026-06-20')], WINDOW_START, WINDOW_END),
    ).toBe(1);
    expect(
      maxConcurrentReservations([range('2026-06-10', '2026-06-10')], WINDOW_START, WINDOW_END),
    ).toBe(1);
  });
});
