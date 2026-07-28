import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '@/client/ui/lib/api-client';

function stubFetch(ok: boolean, body: unknown, status = ok ? 200 : 400) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status,
      text: async () => JSON.stringify(body),
    } as unknown as Response),
  );
}

describe('apiRequest', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('surfaces the server error message (envelope uses `message`)', async () => {
    stubFetch(false, { ok: false, message: 'Only approved bookings can be paid.' });
    const result = await apiRequest('/api/v1/x');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Only approved bookings can be paid.');
  });

  it('returns ok + typed data on success', async () => {
    stubFetch(true, { ok: true, data: { id: '1' } });
    const result = await apiRequest<{ id: string }>('/api/v1/x');
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ id: '1' });
  });

  it('turns a network failure into a non-throwing result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const result = await apiRequest('/api/v1/x');
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
