import { bookingController } from '@/server/modules/bookings/booking.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { BookingFilter } from '@/server/modules/bookings/booking.types';
import type { BookingStatus } from '@/shared/types/booking';
import type { CreateBookingSchemaInput } from '@/shared/contracts/booking/booking.schema';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(request.url);
    const filter: BookingFilter = {
      billboardId: searchParams.get('billboardId')?.trim() || undefined,
      status: (searchParams.get('status')?.trim() as BookingStatus | null) || undefined,
    };

    return bookingController.listBookings(session.user, filter);
  } catch (error) {
    return handleControllerError(error, 'We could not load reservations. Try again.');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const payload = (await request.json()) as CreateBookingSchemaInput;

    return bookingController.createBooking(payload, session.user);
  } catch (error) {
    return handleControllerError(
      error,
      'We could not submit the reservation. Review the details and try again.',
    );
  }
}
