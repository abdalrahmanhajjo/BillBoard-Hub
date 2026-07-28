import { authController } from '@/server/modules/auth/auth.controller';
import { apiResponse } from '@/server/http/api-response';
import { checkRateLimit, requestClientKey } from '@/server/http/rate-limit';
import { USER_MESSAGES } from '@/shared/messages/user-messages';

export async function POST(request: Request) {
  const clientKey = requestClientKey(request);
  const limit = await checkRateLimit(`auth-forgot-password:${clientKey}`, 5, 15 * 60_000);

  if (!limit.allowed) {
    return apiResponse.error('Too many reset requests. Try again in a few minutes.', 429, {
      retryAfterSeconds: limit.retryAfterSeconds,
    });
  }

  try {
    const payload = await request.json();
    return authController.forgotPassword(payload, clientKey);
  } catch {
    return apiResponse.badRequest(USER_MESSAGES.invalidJson);
  }
}
