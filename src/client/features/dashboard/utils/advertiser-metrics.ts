import { BOOKING_STATUSES, PAYMENT_STATUSES } from '@/shared/constants/booking';
import { CAMPAIGN_STATUSES } from '@/shared/constants/campaign';
import { CREATIVE_STATUSES } from '@/shared/constants/creative';
import type { Booking } from '@/shared/types/booking';
import type { Campaign } from '@/shared/types/campaign';
import type { Creative } from '@/shared/types/creative';

/** Bookings that still owe money — the set an advertiser must act on. */
export const OUTSTANDING_PAYMENT_STATUSES: string[] = [
  PAYMENT_STATUSES.PENDING,
  PAYMENT_STATUSES.UNPAID,
  PAYMENT_STATUSES.PARTIALLY_PAID,
];

export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Non-ISO currency codes would throw; fall back to a plain amount.
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function formatDate(value?: string): string {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? '—'
    : parsed.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Bookings can each carry their own invoice currency, so totals are grouped by
 * currency rather than summed into a single misleading figure.
 */
export function sumByCurrency(bookings: Booking[]): Map<string, number> {
  const totals = new Map<string, number>();

  for (const booking of bookings) {
    const currency = booking.invoice?.currency ?? booking.pricing?.currency ?? 'USD';
    const amount = booking.pricing?.total ?? 0;
    totals.set(currency, (totals.get(currency) ?? 0) + amount);
  }

  return totals;
}

export function formatTotals(totals: Map<string, number>): string {
  if (totals.size === 0) return '—';
  return [...totals.entries()]
    .map(([currency, amount]) => formatCurrency(amount, currency))
    .join(' · ');
}

export function isBookingActive(booking: Booking): boolean {
  return (
    booking.status === BOOKING_STATUSES.APPROVED || booking.status === BOOKING_STATUSES.PENDING
  );
}

export function countActiveCampaigns(campaigns: Campaign[]): number {
  return campaigns.filter((campaign) => campaign.status === CAMPAIGN_STATUSES.ACTIVE).length;
}

export function countApprovedCreatives(creatives: Creative[]): number {
  return creatives.filter((creative) => creative.status === CREATIVE_STATUSES.APPROVED).length;
}

export function outstandingBookings(bookings: Booking[]): Booking[] {
  return bookings.filter(
    (booking) =>
      booking.status !== BOOKING_STATUSES.CANCELLED &&
      booking.status !== BOOKING_STATUSES.REJECTED &&
      OUTSTANDING_PAYMENT_STATUSES.includes(booking.paymentStatus),
  );
}

export function countBy<T, K extends string>(items: T[], key: (item: T) => K): Record<K, number> {
  return items.reduce(
    (counts, item) => {
      const bucket = key(item);
      counts[bucket] = (counts[bucket] ?? 0) + 1;
      return counts;
    },
    {} as Record<K, number>,
  );
}
