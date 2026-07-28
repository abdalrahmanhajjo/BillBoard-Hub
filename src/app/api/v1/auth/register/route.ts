import { authController } from '@/server/modules/auth/auth.controller';
import { apiResponse } from '@/server/http/api-response';
import { checkRateLimit, requestClientKey } from '@/server/http/rate-limit';
import { USER_MESSAGES } from '@/shared/messages/user-messages';
import type { RegisterSchemaInput } from '@/shared/contracts/auth/register.schema';

export async function POST(request: Request) {
  // Registration is unauthenticated and writes a row plus a bcrypt hash, so it
  // is both a spam vector and a CPU amplification one.
  const limit = await checkRateLimit(`auth-register:${requestClientKey(request)}`, 5, 60 * 60_000);

  if (!limit.allowed) {
    return apiResponse.error('Too many accounts created from here. Try again later.', 429, {
      retryAfterSeconds: limit.retryAfterSeconds,
    });
  }

  try {
    const payload = (await request.json()) as RegisterSchemaInput;
    return authController.register(payload);
  } catch {
    return apiResponse.badRequest(USER_MESSAGES.invalidJson);
  }
}
