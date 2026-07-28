import { paymentController } from '@/server/modules/payments/payment.controller';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  return paymentController.verifyCheckoutSession(sessionId);
}
