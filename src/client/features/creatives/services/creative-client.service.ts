import { apiRequest } from '@/client/lib/response-utils';
import type {
  CreateCreativeSchemaInput,
  UpdateCreativeStatusSchemaInput,
} from '@/shared/contracts/creative/creative.schema';

export const creativeClientService = {
  async create(payload: CreateCreativeSchemaInput) {
    return apiRequest('/api/v1/creatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },

  async list() {
    return apiRequest('/api/v1/creatives', {
      method: 'GET',
      credentials: 'include',
    });
  },

  async remove(creativeId: string) {
    return apiRequest(`/api/v1/creatives/${creativeId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  },

  async updateStatus(creativeId: string, payload: UpdateCreativeStatusSchemaInput) {
    return apiRequest(`/api/v1/creatives/${creativeId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },
};
