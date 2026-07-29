import { bookingController } from '@/server/modules/bookings/booking.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';

type RouteContext = {
  params: Promise<{ bookingId: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { bookingId } = await params;

    return bookingController.cancelBooking(session.user, bookingId);
  } catch (error) {
    return handleControllerError(
      error,
      'We could not cancel this reservation. Refresh and try again.',
    );
  }
}
