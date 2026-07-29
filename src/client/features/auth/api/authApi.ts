import type { LoginSchemaInput } from '@/shared/contracts/auth/login.schema';
import { RegisterSchemaInput } from '@/shared/contracts/auth/register.schema';
import { apiRequest } from '@/client/ui/lib/api-client';

// Relative, same-origin path — consistent with every other client service
// (which call `/api/v1/...` directly). Avoids double-prefixing when
// NEXT_PUBLIC_BASE_URL already contains `/api/v1`.
const BASE_URL = '/api/v1/auth';

/**
 * Auth requests are the mutation functions for react-query, which must reject
 * on failure — so this rethrows the server's (already user-facing) error
 * message on `!ok` instead of returning a result object.
 */
async function authPost(path: string, body?: unknown) {
  const result = await apiRequest(`${BASE_URL}${path}`, {
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
