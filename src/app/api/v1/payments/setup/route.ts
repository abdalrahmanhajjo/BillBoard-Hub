import { paymentController } from '@/server/modules/payments/payment.controller';
import { apiResponse } from '@/server/http/api-response';
import { checkRateLimit, requestClientKey } from '@/server/http/rate-limit';

export async function POST(request: Request) {
  const key = `payments-setup:${requestClientKey(request)}`;
  const limit = checkRateLimit(key, 12, 10 * 60_000);

  if (!limit.allowed) {
    return apiResponse.error('Too many Visa verification attempts. Please retry shortly.', 429, {
      retryAfterSeconds: limit.retryAfterSeconds,
    });
  }

  return paymentController.createCardSetup();
}
