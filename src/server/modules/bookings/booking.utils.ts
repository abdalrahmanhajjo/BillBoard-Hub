import type { BookingDocument } from '@/server/modules/bookings/booking.model';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import {
  DIGITAL_RESERVATION_DAILY_LIMIT,
  STATIC_RESERVATION_DAILY_LIMIT,
} from '@/shared/constants/booking';
import type { BillboardType } from '@/shared/types/billboard';
import type {
  Booking,
  BookingCurrency,
  BookingStatus,
  CampaignObjective,
  PaymentMethod,
  PaymentStatus,
} from '@/shared/types/booking';

const MS_PER_DAY = 86_400_000;

/** Short, human-friendly reservation reference derived from the id. */
export function buildReference(id: unknown): string {
  return `BR-${String(id).slice(-6).toUpperCase()}`;
}

/** How many reservations a billboard may hold on the same day. */
export function reservationLimitFor(type: BillboardType): number {
  return type === BILLBOARD_TYPES.DIGITAL
    ? DIGITAL_RESERVATION_DAILY_LIMIT
    : STATIC_RESERVATION_DAILY_LIMIT;
}

/**
 * Peak number of the given reservations active on any single day within
 * [rangeStart, rangeEnd]. Date ranges are inclusive, so a day shared by two
 * reservations counts both. Computed with a sweep over day-boundary events.
 */
export function maxConcurrentReservations(
  intervals: Array<{ startDate: Date; endDate: Date }>,
  rangeStart: Date,
  rangeEnd: Date,
): number {
  const events: Array<{ time: number; delta: number }> = [];
  for (const interval of intervals) {
    const start = Math.max(new Date(interval.startDate).getTime(), rangeStart.getTime());
    const end = Math.min(new Date(interval.endDate).getTime(), rangeEnd.getTime());
    if (start > end) continue;
    events.push({ time: start, delta: 1 });
    events.push({ time: end + MS_PER_DAY, delta: -1 });
  }
  // At an equal timestamp, apply ends (-1) before starts (+1): a reservation
  // ending on a day and another starting the next do not overlap.
  events.sort((a, b) => a.time - b.time || a.delta - b.delta);

  let current = 0;
  let peak = 0;
  for (const event of events) {
    current += event.delta;
    if (current > peak) peak = current;
  }
  return peak;
}

function toIsoDate(value: Date): string {
  return new Date(value).toISOString().slice(0, 10);
}

export function toBooking(doc: BookingDocument): Booking {
  return {
    id: String(doc._id),
    reference: buildReference(doc._id),
    billboardId: doc.billboardId,
    advertiserId: doc.advertiserId,
    campaignName: doc.campaignName,
    objective: doc.objective as CampaignObjective,
    targetAudience: doc.targetAudience ?? undefined,
    brief: doc.brief ?? undefined,
    notes: doc.notes ?? undefined,
    startDate: toIsoDate(doc.startDate),
    endDate: toIsoDate(doc.endDate),
    creativeUrl: doc.creativeUrl ?? undefined,
    billing: {
      contactName: doc.billing.contactName,
      email: doc.billing.email,
      phone: doc.billing.phone,
      vatNumber: doc.billing.vatNumber ?? undefined,
    },
    company: {
      name: doc.company.name,
      commercialRegister: doc.company.commercialRegister ?? undefined,
      address: doc.company.address,
      country: doc.company.country,
    },
    paymentMethod: doc.paymentMethod as PaymentMethod,
    // Older reservations predate payment tracking; show them as awaiting reconciliation.
    paymentStatus: (doc.paymentStatus ?? 'pending') as PaymentStatus,
    invoice: {
      currency: doc.invoice.currency as BookingCurrency,
      email: doc.invoice.email,
      poNumber: doc.invoice.poNumber ?? undefined,
    },
    pricing: {
      days: doc.pricing.days,
      dailyRate: doc.pricing.dailyRate,
      subtotal: doc.pricing.subtotal,
      serviceFee: doc.pricing.serviceFee,
      vat: doc.pricing.vat,
      total: doc.pricing.total,
      currency: doc.pricing.currency as BookingCurrency,
    },
    status: doc.status as BookingStatus,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
  };
}
