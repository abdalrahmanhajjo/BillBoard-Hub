import { bookingRepository } from '@/server/modules/bookings/booking.repository';
import {
  maxConcurrentReservations,
  reservationLimitFor,
  toBooking,
} from '@/server/modules/bookings/booking.utils';
import type { BookingFilter, BookingRecord } from '@/server/modules/bookings/booking.types';
import { billboardRepository } from '@/server/modules/billboards/billboard.repository';
import { authorizationPolicy } from '@/shared/policies';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '@/shared/http/http-error';
import { BILLBOARD_STATUSES, BILLBOARD_TYPES } from '@/shared/constants/billboard';
import {
  BLOCKING_BOOKING_STATUSES,
  BOOKING_STATUSES,
  PAYMENT_STATUSES,
  STATIC_RESERVATION_DAILY_LIMIT,
} from '@/shared/constants/booking';
import { computeBookingPricing, inclusiveDays } from '@/shared/pricing/booking-pricing';
import type { CreateBookingSchemaOutput } from '@/shared/contracts/booking/booking.schema';
import type { BillboardType } from '@/shared/types/billboard';
import type { Booking, BookingStatus } from '@/shared/types/booking';
import type { User } from '@/shared/types/user';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function fullyBookedMessage(type: BillboardType, limit: number): string {
  return type === BILLBOARD_TYPES.DIGITAL
    ? `This screen is fully booked for one or more of these days (limit ${limit} ads at a time). Please choose different dates.`
    : 'These dates are already booked for this billboard. Please choose different dates.';
}

export const bookingService = {
  /**
   * Creates a reservation request. Validates the billboard and dates, blocks
   * double-booking via overlap detection, and computes the authoritative quote
   * from the billboard's monthly price (the client-sent amount is ignored).
   */
  async create(input: CreateBookingSchemaOutput, actor: User): Promise<Booking> {
    authorizationPolicy.booking.assertCanCreate(actor);

    const billboard = await billboardRepository.findById(input.billboardId);
    if (!billboard) {
      throw new NotFoundError('Billboard not found.');
    }
    if (billboard.status !== BILLBOARD_STATUSES.AVAILABLE) {
      throw new BadRequestError('This billboard is not currently available for booking.');
    }

    const startDate = input.startDate.slice(0, 10);
    const endDate = input.endDate.slice(0, 10);
    if (startDate < todayIsoDate()) {
      throw new BadRequestError('The start date cannot be in the past.');
    }

    const days = inclusiveDays(startDate, endDate);
    if (days < 1) {
      throw new BadRequestError('The campaign must run for at least one day.');
    }

    // A static billboard shows one ad at a time; a digital screen rotates up to
    // its daily limit. Block only when the requested days would exceed capacity.
    const overlapping = await bookingRepository.findOverlapping(
      input.billboardId,
      new Date(startDate),
      new Date(endDate),
      BLOCKING_BOOKING_STATUSES,
    );
    const limit = reservationLimitFor(billboard.type);
    const peak = maxConcurrentReservations(overlapping, new Date(startDate), new Date(endDate));
    if (peak >= limit) {
      throw new ConflictError(fullyBookedMessage(billboard.type, limit));
    }

    const pricing = computeBookingPricing(billboard.monthlyPrice, days);

    const record: BookingRecord = {
      billboardId: input.billboardId,
      advertiserId: actor.id,
      campaignName: input.campaignName,
      objective: input.objective,
      targetAudience: input.targetAudience,
      brief: input.brief,
      notes: input.notes,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      creativeUrl: input.creativeUrl,
      billing: input.billing,
      company: input.company,
      paymentMethod: input.paymentMethod,
      paymentStatus: PAYMENT_STATUSES.PENDING,
      invoice: input.invoice,
      pricing: { ...pricing, currency: input.invoice.currency },
      status: BOOKING_STATUSES.PENDING,
    };

    const created = await bookingRepository.create(record);
    return toBooking(created);
  },

  /** Advertisers see their own reservations; admins (moderators) see all. */
  async list(actor: User, filter: BookingFilter = {}): Promise<Booking[]> {
    authorizationPolicy.booking.assertCanRead(actor);

    const scoped: BookingFilter = authorizationPolicy.booking.canModerate(actor.role)
      ? filter
      : { advertiserId: actor.id, billboardId: filter.billboardId, status: filter.status };

    const bookings = await bookingRepository.findMany(scoped);
    return bookings.map(toBooking);
  },

  async getById(actor: User, bookingId: string): Promise<Booking> {
    authorizationPolicy.booking.assertCanRead(actor);

    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Reservation not found.');
    }
    if (!authorizationPolicy.booking.canModerate(actor.role) && booking.advertiserId !== actor.id) {
      throw new ForbiddenError('You cannot access this reservation.');
    }

    return toBooking(booking);
  },

  async updateStatus(actor: User, bookingId: string, status: BookingStatus): Promise<Booking> {
    authorizationPolicy.booking.assertCanModerate(actor);

    const existing = await bookingRepository.findById(bookingId);
    if (!existing) {
      throw new NotFoundError('Reservation not found.');
    }

    // Approval is the gate that blocks the calendar, so guard it against the
    // billboard's daily capacity (1 for static, the rotation limit for digital).
    if (status === BOOKING_STATUSES.APPROVED) {
      const billboard = await billboardRepository.findById(existing.billboardId);
      const limit = billboard
        ? reservationLimitFor(billboard.type)
        : STATIC_RESERVATION_DAILY_LIMIT;
      const overlapping = await bookingRepository.findOverlapping(
        existing.billboardId,
        new Date(existing.startDate),
        new Date(existing.endDate),
        BLOCKING_BOOKING_STATUSES,
        bookingId,
      );
      const peak = maxConcurrentReservations(
        overlapping,
        new Date(existing.startDate),
        new Date(existing.endDate),
      );
      if (peak >= limit) {
        throw new ConflictError(
          billboard && billboard.type === BILLBOARD_TYPES.DIGITAL
            ? `Cannot approve: this screen already has its ${limit}-ad daily limit booked for one or more of these days.`
            : 'Cannot approve: these dates overlap an already-approved reservation for this billboard.',
        );
      }
    }

    const updated = await bookingRepository.updateStatus(bookingId, status);
    if (!updated) {
      throw new NotFoundError('Reservation not found.');
    }

    return toBooking(updated);
  },

  /** An advertiser cancels their own reservation (or an admin cancels any). */
  async cancel(actor: User, bookingId: string): Promise<Booking> {
    authorizationPolicy.booking.assertCanRead(actor);

    const existing = await bookingRepository.findById(bookingId);
    if (!existing) {
      throw new NotFoundError('Reservation not found.');
    }
    if (
      !authorizationPolicy.booking.canModerate(actor.role) &&
      existing.advertiserId !== actor.id
    ) {
      throw new ForbiddenError('You cannot cancel this reservation.');
    }

    const cancellable: BookingStatus[] = [BOOKING_STATUSES.PENDING, BOOKING_STATUSES.APPROVED];
    if (!cancellable.includes(existing.status)) {
      throw new BadRequestError('This reservation can no longer be cancelled.');
    }

    const updated = await bookingRepository.updateStatus(bookingId, BOOKING_STATUSES.CANCELLED);
    if (!updated) {
      throw new NotFoundError('Reservation not found.');
    }

    return toBooking(updated);
  },
};
