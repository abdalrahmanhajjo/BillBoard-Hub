import type {
  CreateScheduleSchemaInput,
  UpdateScheduleSchemaInput,
} from '@/shared/contracts/schedule/schedule.schema';
import { apiRequest } from '@/client/ui/lib/api-client';

export const scheduleClientService = {
  async create(payload: CreateScheduleSchemaInput) {
    return apiRequest('/api/v1/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },

  async list(billboardId?: string) {
    const query = billboardId ? `?billboardId=${encodeURIComponent(billboardId)}` : '';
    return apiRequest(`/api/v1/schedules${query}`, {
      method: 'GET',
      credentials: 'include',
    });
  },

  async update(scheduleId: string, payload: UpdateScheduleSchemaInput) {
    return apiRequest(`/api/v1/schedules/${encodeURIComponent(scheduleId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },

  async remove(scheduleId: string) {
    return apiRequest(`/api/v1/schedules/${encodeURIComponent(scheduleId)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  },
};
