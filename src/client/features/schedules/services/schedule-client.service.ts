import type {
  CreateScheduleSchemaInput,
  UpdateScheduleSchemaInput,
} from '@/shared/contracts/schedule/schedule.schema';

async function parseResponse(response: Response) {
  const payload = await response.json();
  if (!response.ok) {
    return { ok: false, error: payload?.error ?? 'Request failed.', data: payload?.data };
  }
  return { ok: payload?.ok ?? true, error: payload?.error, data: payload?.data };
}

export const scheduleClientService = {
  async create(payload: CreateScheduleSchemaInput) {
    const response = await fetch('/api/v1/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },

  async list(billboardId?: string) {
    const query = billboardId ? `?billboardId=${encodeURIComponent(billboardId)}` : '';
    const response = await fetch(`/api/v1/schedules${query}`, {
      method: 'GET',
      credentials: 'include',
    });
    return parseResponse(response);
  },

  async update(scheduleId: string, payload: UpdateScheduleSchemaInput) {
    const response = await fetch(`/api/v1/schedules/${scheduleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },

  async remove(scheduleId: string) {
    const response = await fetch(`/api/v1/schedules/${scheduleId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return parseResponse(response);
  },
};
