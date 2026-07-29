import { USER_MESSAGES } from '@/shared/messages/user-messages';

type ApiData = Record<string, unknown>;

export type ApiClientResult<T = ApiData> = {
  ok: boolean;
  error?: string;
  data?: T;
};

type ApiEnvelope<T> = {
  ok?: boolean;
  error?: string;
  message?: string;
  data?: T;
};

function invalidResponse<T>(): ApiClientResult<T> {
  return {
    ok: false,
    error: USER_MESSAGES.invalidResponse,
  };
}

async function parseApiResponse<T>(response: Response): Promise<ApiClientResult<T>> {
  const body = await response.text();
  let payload: ApiEnvelope<T> = {};

  if (body) {
    try {
      const parsed: unknown = JSON.parse(body);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return invalidResponse<T>();
      }
      payload = parsed as ApiEnvelope<T>;
    } catch {
      return invalidResponse<T>();
    }
  }

  if (!response.ok) {
    return {
      ok: false,
      error: payload.error ?? payload.message ?? USER_MESSAGES.requestFailed,
      data: payload.data,
    };
  }

  return {
    ok: payload.ok ?? true,
    error: payload.error,
    data: payload.data,
  };
}

/**
 * Shared browser API boundary.
 *
 * Feature services keep endpoint-specific paths and payloads, while this
 * helper normalizes JSON parsing, non-2xx responses, and network failures.
 */
export async function apiRequest<T = ApiData>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<ApiClientResult<T>> {
  try {
    const response = await fetch(input, init);
    return await parseApiResponse<T>(response);
  } catch {
    return {
      ok: false,
      error: USER_MESSAGES.networkUnavailable,
    };
  }
}
