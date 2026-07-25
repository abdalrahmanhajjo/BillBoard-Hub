import { apiResponse } from '@/server/http/api-response';
import { handleControllerError, validationMessage } from '@/server/http/controller-utils';
import { bookingService } from '@/server/modules/bookings/booking.service';
import type { BookingFilter } from '@/server/modules/bookings/booking.types';
import {
  createBookingSchema,
  updateBookingStatusSchema,
  type CreateBookingSchemaInput,
  type UpdateBookingStatusSchemaInput,
} from '@/shared/contracts/booking/booking.schema';
import type { User } from '@/shared/types/user';

export const bookingController = {
  async createBooking(payload: CreateBookingSchemaInput, actor: User) {
    const parsed = createBookingSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid reservation data.'),
      );
    }

    try {
      const booking = await bookingService.create(parsed.data, actor);
      return apiResponse.ok(booking, 201);
    } catch (error) {
      return handleControllerError(error, 'Reservation failed.');
    }
  },

  async listBookings(actor: User, filter: BookingFilter) {
    try {
      const bookings = await bookingService.list(actor, filter);
      return apiResponse.ok({ bookings });
    } catch (error) {
      return handleControllerError(error, 'Getting reservations failed.');
    }
  },

  async getBooking(actor: User, bookingId: string) {
    if (!bookingId) {
      return apiResponse.badRequest('Reservation id is required.');
    }

    try {
      const booking = await bookingService.getById(actor, bookingId);
      return apiResponse.ok({ booking });
    } catch (error) {
      return handleControllerError(error, 'Getting reservation failed.');
    }
  },

  async updateBookingStatus(
    actor: User,
    bookingId: string,
    payload: UpdateBookingStatusSchemaInput,
  ) {
    if (!bookingId) {
      return apiResponse.badRequest('Reservation id is required.');
    }

    const parsed = updateBookingStatusSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid reservation status.'),
      );
    }

    try {
      const booking = await bookingService.updateStatus(actor, bookingId, parsed.data.status);
      return apiResponse.ok(booking);
    } catch (error) {
      return handleControllerError(error, 'Updating reservation failed.');
    }
  },

  async cancelBooking(actor: User, bookingId: string) {
    if (!bookingId) {
      return apiResponse.badRequest('Reservation id is required.');
    }

    try {
      const booking = await bookingService.cancel(actor, bookingId);
      return apiResponse.ok(booking);
    } catch (error) {
      return handleControllerError(error, 'Cancelling reservation failed.');
    }
  },
};
