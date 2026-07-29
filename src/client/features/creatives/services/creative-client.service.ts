import type {
  CreateAdCreativeSchemaInput,
  UpdateAdCreativeSchemaInput,
} from '@/shared/contracts/ad-creative/ad-creative.schema';
import { apiRequest } from '@/client/ui/lib/api-client';

export const creativeClientService = {
  async create(payload: CreateAdCreativeSchemaInput) {
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
    return apiRequest(`/api/v1/creatives/${encodeURIComponent(creativeId)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  },

  async update(creativeId: string, payload: UpdateAdCreativeSchemaInput) {
    return apiRequest(`/api/v1/creatives/${encodeURIComponent(creativeId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },
};
