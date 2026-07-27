import { AuthError } from 'next-auth';
import type { Session } from 'next-auth';
import { auth } from '@/auth';
import { apiResponse } from '@/server/http/api-response';
import { HttpError, NotFoundError, UnauthorizedError } from '@/shared/http/http-error';

export function validationMessage(
  issues: Array<{ message?: string }> | undefined,
  fallbackMessage: string,
): string {
  return issues?.[0]?.message ?? fallbackMessage;
}

export async function requireSession(): Promise<Session> {
  const session = await auth();

  if (!session?.user?.id || !session.user.isActive) {
    throw new UnauthorizedError('Not authenticated.');
  }

  return session;
}

export function handleControllerError(error: unknown, message: string) {
  if (error instanceof AuthError) {
    return apiResponse.unauthorized('Invalid email or password.');
  }

  if (error instanceof NotFoundError) {
    return apiResponse.notFound(error.message);
  }

  // Catch invalid MongoDB ObjectId format
  if (error && (error as { name?: string; message?: string }).name === 'CastError') {
    return apiResponse.notFound('Not found.');
  }

  if (error instanceof HttpError) {
    return apiResponse.error(error.message, error.status);
  }

  if (error instanceof SyntaxError) {
    return apiResponse.badRequest('Invalid JSON payload.');
  }

  if ((error as { code?: number } | null)?.code === 11000) {
    return apiResponse.conflict('A record with these details already exists.');
  }

  if (error instanceof Error) {
    console.error('Error:', error.message);
    return apiResponse.internal(message);
  }

  return apiResponse.internal(message);
}
