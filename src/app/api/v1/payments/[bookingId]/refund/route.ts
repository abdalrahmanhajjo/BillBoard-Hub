import { paymentController } from '@/server/modules/payments/payment.controller';
import { apiResponse } from '@/server/http/api-response';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  try {
    const { bookingId } = await params;
    const payload = await request.json();
    return paymentController.refundPayment({ ...payload, bookingId });
  } catch {
    return apiResponse.badRequest('The refund details are not valid JSON.');
  }
}
