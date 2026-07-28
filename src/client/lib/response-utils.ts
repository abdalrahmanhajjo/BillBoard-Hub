/**
 * Normalizes a fetch `Response` into a `{ ok, error, data }` result. The return
 * type is intentionally inferred (loose `data`) to match the per-service
 * implementations this replaced; typing individual responses is a follow-up.
 *
 * Building block for `apiRequest` — prefer `apiRequest` in feature services.
 */
export async function parseResponse(response: Response) {
  const payload = await response.json();
  if (!response.ok) {
    // The server error envelope carries user-facing text in `message`
    // (see `apiResponse.error`); `error` is kept as a fallback.
    return {
      ok: false,
      error: payload?.message ?? payload?.error ?? 'Request failed.',
      data: payload?.data,
    };
  }
  return { ok: payload?.ok ?? true, error: payload?.error, data: payload?.data };
}

/**
 * The single client HTTP entry point. Performs the request, normalizes the
 * response envelope, and turns network failures into a `{ ok: false }` result
 * (rather than a thrown error) so feature services can handle everything the
 * same way. For react-query mutation functions that must reject on failure,
 * see `@/client/features/auth/api/authApi`, which throws on `!result.ok`.
 */
export async function apiRequest(input: RequestInfo | URL, init?: RequestInit) {
  try {
    const response = await fetch(input, init);
    return await parseResponse(response);
  } catch {
    return {
      ok: false as const,
      error: 'We could not reach the server. Check your connection and try again.',
      data: undefined,
    };
  }
}
