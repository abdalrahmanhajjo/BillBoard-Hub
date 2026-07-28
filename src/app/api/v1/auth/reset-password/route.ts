import { authController } from '@/server/modules/auth/auth.controller';
import { apiResponse } from '@/server/http/api-response';
import { checkRateLimit, requestClientKey } from '@/server/http/rate-limit';
import { USER_MESSAGES } from '@/shared/messages/user-messages';

/** Tells the reset page whether its link is still usable before it renders a form. */
export async function GET(request: Request) {
  const clientKey = requestClientKey(request);
  const limit = await checkRateLimit(`auth-verify-reset-token:${clientKey}`, 30, 15 * 60_000);

  if (!limit.allowed) {
    return apiResponse.error('Too many attempts. Try again in a few minutes.', 429, {
      retryAfterSeconds: limit.retryAfterSeconds,
    });
  }

  const token = new URL(request.url).searchParams.get('token');
  return authController.verifyResetToken(token);
}

export async function POST(request: Request) {
  const clientKey = requestClientKey(request);
  const limit = await checkRateLimit(`auth-reset-password:${clientKey}`, 10, 15 * 60_000);

  if (!limit.allowed) {
    return apiResponse.error('Too many attempts. Try again in a few minutes.', 429, {
      retryAfterSeconds: limit.retryAfterSeconds,
    });
  }

  try {
    const payload = await request.json();
    return authController.resetPassword(payload);
  } catch {
    return apiResponse.badRequest(USER_MESSAGES.invalidJson);
  }
}
