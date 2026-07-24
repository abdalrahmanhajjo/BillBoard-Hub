import type { LoginSchemaInput } from '@/shared/contracts/auth/login.schema';
import type { RegisterSchemaInput } from '@/shared/contracts/auth/register.schema';

type AuthClientResult = {
  ok: boolean;
  error?: string;
  data?: unknown;
};

async function parseResponse(response: Response): Promise<AuthClientResult> {
  let payload: { ok?: boolean; error?: string; data?: unknown } = {};

  try {
    payload = await response.json();
  } catch {
    if (!response.ok) {
      return { ok: false, error: 'The server returned an invalid response.' };
    }
  }

  if (!response.ok) {
    return {
      ok: false,
      error: payload?.error ?? 'Request failed.',
      data: payload?.data,
    };
  }

  return {
    ok: payload?.ok ?? true,
    error: payload?.error,
    data: payload?.data,
  };
}

async function authRequest(path: string, init: RequestInit): Promise<AuthClientResult> {
  try {
    const response = await fetch(path, init);
    return parseResponse(response);
  } catch {
    return {
      ok: false,
      error: 'Unable to reach the server. Check your connection and try again.',
    };
  }
}

export const authClientService = {
  async register(payload: RegisterSchemaInput) {
    return authRequest('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },

  async login(payload: LoginSchemaInput) {
    return authRequest('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },

  async logout() {
    return authRequest('/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  },

  async me() {
    return authRequest('/api/v1/auth/me', {
      method: 'GET',
      credentials: 'include',
    });
  },

  async refresh() {
    return authRequest('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
  },
};
