import { paymentController } from '@/server/modules/payments/payment.controller';
import { apiResponse } from '@/server/http/api-response';
import { checkRateLimit, requestClientKey } from '@/server/http/rate-limit';

export async function POST(request: Request) {
  const key = `payments-checkout:${requestClientKey(request)}`;
  const limit = checkRateLimit(key, 30, 60_000);

  if (!limit.allowed) {
    return apiResponse.error('Too many checkout attempts. Please retry shortly.', 429, {
      retryAfterSeconds: limit.retryAfterSeconds,
    });
  }

  try {
    const payload = await request.json();
    return paymentController.createCheckoutSession(payload);
  } catch {
    return apiResponse.badRequest('Invalid JSON payload.');
  }
}
