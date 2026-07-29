import { bookingController } from '@/server/modules/bookings/booking.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';

type RouteContext = {
  params: Promise<{ bookingId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { bookingId } = await params;

    return bookingController.getBooking(session.user, bookingId);
  } catch (error) {
    return handleControllerError(error, 'We could not load this reservation. Try again.');
  }
}
