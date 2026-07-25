import { bookingController } from '@/server/modules/bookings/booking.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { UpdateBookingStatusSchemaInput } from '@/shared/contracts/booking/booking.schema';

type RouteContext = {
  params: Promise<{ bookingId: string }>;
};

async function handleUpdate(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { bookingId } = await params;
    const payload = (await request.json()) as UpdateBookingStatusSchemaInput;

    return bookingController.updateBookingStatus(session.user, bookingId, payload);
  } catch (error) {
    return handleControllerError(error, 'Updating reservation failed.');
  }
}

export const PATCH = handleUpdate;
