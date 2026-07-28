import { authController } from '@/server/modules/auth/auth.controller';
import { apiResponse } from '@/server/http/api-response';
import { checkRateLimit, requestClientKey } from '@/server/http/rate-limit';
import { USER_MESSAGES } from '@/shared/messages/user-messages';
import type { LoginSchemaInput } from '@/shared/contracts/auth/login.schema';

const TOO_MANY_ATTEMPTS = 'Too many sign-in attempts. Try again in a few minutes.';

export async function POST(request: Request) {
  const clientKey = requestClientKey(request);

  // Per-client cap stops a single host grinding through passwords.
  const clientLimit = await checkRateLimit(`auth-login-ip:${clientKey}`, 20, 15 * 60_000);
  if (!clientLimit.allowed) {
    return apiResponse.error(TOO_MANY_ATTEMPTS, 429, {
      retryAfterSeconds: clientLimit.retryAfterSeconds,
    });
  }

  let payload: { email?: unknown };
  try {
    payload = (await request.json()) as { email?: unknown };
  } catch {
    return apiResponse.badRequest(USER_MESSAGES.invalidJson);
  }

  // Per-account cap stops a distributed attack spreading guesses for one victim
  // across many addresses, which the per-client cap alone would not catch.
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (email) {
    const accountLimit = await checkRateLimit(
      `auth-login-account:${email.slice(0, 64)}`,
      10,
      15 * 60_000,
    );
    if (!accountLimit.allowed) {
      return apiResponse.error(TOO_MANY_ATTEMPTS, 429, {
        retryAfterSeconds: accountLimit.retryAfterSeconds,
      });
    }
  }

  return authController.login(payload as LoginSchemaInput);
}
