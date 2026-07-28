import { describe, expect, it } from 'vitest';
import { parseResponse } from '@/client/lib/response-utils';

function fakeResponse(ok: boolean, body: unknown): Response {
  return { ok, json: async () => body } as Response;
}

describe('parseResponse', () => {
  it('surfaces the server error message (envelope uses `message`)', async () => {
    const result = await parseResponse(
      fakeResponse(false, { ok: false, message: 'Only approved bookings can be paid.' }),
    );
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Only approved bookings can be paid.');
  });

  it('falls back to a generic error when no message is present', async () => {
    const result = await parseResponse(fakeResponse(false, {}));
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Request failed.');
  });

  it('returns ok + data on a successful response', async () => {
    const result = await parseResponse(fakeResponse(true, { ok: true, data: { id: '1' } }));
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ id: '1' });
  });
});
