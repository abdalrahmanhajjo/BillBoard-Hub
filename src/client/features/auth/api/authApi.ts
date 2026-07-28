import type { LoginSchemaInput } from '@/shared/contracts/auth/login.schema';
import { RegisterSchemaInput } from '@/shared/contracts/auth/register.schema';
import type {
  ForgotPasswordSchemaInput,
  ResetPasswordSchemaInput,
} from '@/shared/contracts/auth/password-reset.schema';
import { apiRequest } from '@/client/ui/lib/api-client';

// Relative, same-origin path — consistent with every other client service
// (which call `/api/v1/...` directly). Avoids double-prefixing when
// NEXT_PUBLIC_BASE_URL already contains `/api/v1`.
const BASE_URL = '/api/v1/auth';

type MessageResponse = { message: string };

/**
 * `previewUrl` is present only in local development with no mail provider
 * configured — the server refuses to send it otherwise.
 */
type ForgotPasswordResponse = MessageResponse & { previewUrl?: string; previewNote?: string };

/**
 * Auth requests are the mutation functions for react-query, which must reject
 * on failure — so this rethrows the server's (already user-facing) error
 * message on `!ok` instead of returning a result object.
 */
async function authPost<T = unknown>(path: string, body?: unknown) {
  const result = await apiRequest<T>(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!result.ok) {
    throw new Error(result.error ?? 'Request failed.');
  }
  return result.data;
}

export const login = (input: LoginSchemaInput) => authPost('/login', input);

export const register = (input: RegisterSchemaInput) => authPost('/register', input);

export const logout = () => authPost('/logout');

export const requestPasswordReset = (input: ForgotPasswordSchemaInput) =>
  authPost<ForgotPasswordResponse>('/forgot-password', input);

export const resetPassword = (input: ResetPasswordSchemaInput) =>
  authPost<MessageResponse>('/reset-password', input);

/**
 * Read-only link check used before the reset form renders. A failed request is
 * reported as "unusable" so the page always has a definite answer to show.
 */
export async function verifyResetToken(token: string): Promise<boolean> {
  if (!token) {
    return false;
  }

  const result = await apiRequest<{ valid: boolean }>(
    `${BASE_URL}/reset-password?token=${encodeURIComponent(token)}`,
  );

  return result.ok && result.data?.valid === true;
}
