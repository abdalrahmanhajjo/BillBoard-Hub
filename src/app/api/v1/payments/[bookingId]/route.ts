import { paymentController } from '@/server/modules/payments/payment.controller';
import { apiResponse } from '@/server/http/api-response';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params;
  return paymentController.getByBookingId(bookingId);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  try {
    const { bookingId } = await params;
    const payload = await request.json();
    return paymentController.recordManualPayment({ ...payload, bookingId });
  } catch {
    return apiResponse.badRequest('The payment details are not valid JSON.');
  }
}
