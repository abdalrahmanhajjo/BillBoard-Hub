import { paymentController } from '@/server/modules/payments/payment.controller';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params;
  return paymentController.getByBookingId(bookingId);
}
