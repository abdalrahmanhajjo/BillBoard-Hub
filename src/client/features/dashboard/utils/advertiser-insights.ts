import { BOOKING_STATUSES } from '@/shared/constants/booking';
import type { Booking, BookingStatus } from '@/shared/types/booking';

/**
 * Chart and trend inputs for the advertiser dashboard.
 *
 * The API exposes no aggregate endpoint for advertisers, so these figures are
 * derived from the owner-scoped booking list the workspace already loads. They
 * live here as pure functions so the numbers on screen are testable without
 * rendering a chart.
 */

export type SpendPoint = {
  /** `YYYY-MM`, used for sorting and as a stable React key. */
  month: string;
  label: string;
  spend: number;
  reservations: number;
};

export type StatusSlice = {
  status: BookingStatus;
  label: string;
  count: number;
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: '#f59e0b',
  approved: '#2563eb',
  completed: '#22c55e',
  rejected: '#f43f5e',
  cancelled: '#94a3b8',
};

/** A reservation only counts as money committed once it is not refused. */
function isBillable(booking: Booking): boolean {
  return (
    booking.status !== BOOKING_STATUSES.CANCELLED && booking.status !== BOOKING_STATUSES.REJECTED
  );
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function monthLabel(key: string): string {
  const parsed = new Date(`${key}-01T00:00:00Z`);
  return Number.isNaN(parsed.getTime())
    ? key
    : parsed.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
}

/** Total value of every reservation that has not been cancelled or rejected. */
export function totalCommitted(bookings: Booking[]): number {
  return bookings
    .filter(isBillable)
    .reduce((total, booking) => total + (booking.pricing?.total ?? 0), 0);
}

/**
 * Spend per calendar month of the campaign start date, oldest first.
 *
 * The window deliberately leans forward. Outdoor campaigns are reserved months
 * ahead, so a backward-only window shows an empty chart and a zero total while
 * the advertiser has real money committed — the figures would contradict the
 * outstanding balance sitting next to them.
 *
 * Months with no reservations are filled in rather than skipped: a chart that
 * jumps from January to June implies continuous activity that did not happen.
 */
export function spendByMonth(
  bookings: Booking[],
  { back = 2, forward = 9, now = new Date() }: { back?: number; forward?: number; now?: Date } = {},
): SpendPoint[] {
  const buckets = new Map<string, { spend: number; reservations: number }>();

  for (let offset = -back; offset <= forward; offset += 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
    buckets.set(date.toISOString().slice(0, 7), { spend: 0, reservations: 0 });
  }

  for (const booking of bookings) {
    if (!isBillable(booking)) continue;

    const bucket = buckets.get(monthKey(booking.startDate));
    if (!bucket) continue;

    bucket.spend += booking.pricing?.total ?? 0;
    bucket.reservations += 1;
  }

  return [...buckets.entries()].map(([month, totals]) => ({
    month,
    label: monthLabel(month),
    spend: Math.round(totals.spend),
    reservations: totals.reservations,
  }));
}

export function currentMonthKey(now = new Date()): string {
  return now.toISOString().slice(0, 7);
}

export function statusBreakdown(bookings: Booking[]): StatusSlice[] {
  const counts = new Map<BookingStatus, number>();

  for (const booking of bookings) {
    counts.set(booking.status, (counts.get(booking.status) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([status, count]) => ({
      status,
      label: BOOKING_STATUS_LABELS[status] ?? status,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Percentage change between the last two whole months.
 *
 * Growth from a zero baseline is reported as `null` rather than `Infinity` or a
 * meaningless 100%: there is no percentage change from nothing, and the caller
 * shows no trend pill at all in that case.
 */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

/**
 * Compares the calendar month in progress against the one before it.
 *
 * The window returned by `spendByMonth` runs into the future, so the last two
 * buckets are upcoming months, not recent history — the comparison is anchored
 * on the current month explicitly rather than on array position.
 */
export function monthOverMonth(
  points: SpendPoint[],
  now = new Date(),
): { spend: number | null; reservations: number | null } {
  const index = points.findIndex((point) => point.month === currentMonthKey(now));
  const current = points[index];
  const previous = index > 0 ? points[index - 1] : undefined;

  if (!current || !previous) return { spend: null, reservations: null };

  return {
    spend: percentChange(current.spend, previous.spend),
    reservations: percentChange(current.reservations, previous.reservations),
  };
}

/** Reservations whose window has not finished yet, soonest first. */
export function upcomingBookings(bookings: Booking[], limit = 6, now = new Date()): Booking[] {
  const today = now.toISOString().slice(0, 10);

  return bookings
    .filter((booking) => booking.status !== BOOKING_STATUSES.CANCELLED && booking.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, limit);
}

/** Most recently created reservations, newest first, for the activity feed. */
export function recentBookings(bookings: Booking[], limit = 5): Booking[] {
  return [...bookings]
    .sort((a, b) => (b.createdAt ?? b.startDate).localeCompare(a.createdAt ?? a.startDate))
    .slice(0, limit);
}
