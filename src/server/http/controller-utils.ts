import { AuthError } from 'next-auth';
import type { Session } from 'next-auth';
import { auth } from '@/auth';
import { apiResponse } from '@/server/http/api-response';
import { HttpError, NotFoundError, UnauthorizedError } from '@/shared/http/http-error';
import { USER_MESSAGES } from '@/shared/messages/user-messages';

export function validationMessage(
  issues: Array<{ message?: string }> | undefined,
  fallbackMessage: string,
): string {
  return issues?.[0]?.message ?? fallbackMessage;
}

export async function requireSession(): Promise<Session> {
  const session = await auth();

  if (!session?.user?.id || !session.user.isActive) {
    throw new UnauthorizedError(USER_MESSAGES.sessionRequired);
  }

  return session;
}

export function handleControllerError(error: unknown, message: string) {
  if (error instanceof AuthError) {
    return apiResponse.unauthorized(USER_MESSAGES.invalidCredentials);
  }

  if (error instanceof NotFoundError) {
    return apiResponse.notFound(error.message);
  }

  // Catch invalid MongoDB ObjectId format
  if (error && (error as { name?: string; message?: string }).name === 'CastError') {
    return apiResponse.notFound(USER_MESSAGES.notFound);
  }

  if (error instanceof HttpError) {
    return apiResponse.error(error.message, error.status);
  }

  if (error instanceof SyntaxError) {
    return apiResponse.badRequest(USER_MESSAGES.invalidJson);
  }

  if ((error as { code?: number } | null)?.code === 11000) {
    return apiResponse.conflict(USER_MESSAGES.duplicate);
  }

  // Unexpected errors: return a generic message so raw internal error text is
  // never exposed to clients. Intentional, user-facing errors are handled by
  // the HttpError/validation branches above.
  return apiResponse.internal(message);
}
