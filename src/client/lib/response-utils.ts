export const getResponse = async <T = unknown>(response: Response): Promise<T> => {
  const res = await response.json();
  if (!res.ok) {
    throw new Error(res.message);
  }
  return res;
};

/**
 * Normalizes a fetch `Response` into a `{ ok, error, data }` result for feature
 * client services (shared instead of being redefined per service). The return
 * type is intentionally inferred (loose `data`) to match the per-service
 * implementations this replaces; typing individual responses is a follow-up.
 */
export async function parseResponse(response: Response) {
  const payload = await response.json();
  if (!response.ok) {
    return { ok: false, error: payload?.error ?? 'Request failed.', data: payload?.data };
  }
  return { ok: payload?.ok ?? true, error: payload?.error, data: payload?.data };
}
