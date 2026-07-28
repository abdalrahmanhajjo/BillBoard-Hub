import { parseResponse } from '@/client/lib/response-utils';
import type {
  CreateCreativeSchemaInput,
  UpdateCreativeStatusSchemaInput,
} from '@/shared/contracts/creative/creative.schema';

export const creativeClientService = {
  async create(payload: CreateCreativeSchemaInput) {
    const response = await fetch('/api/v1/creatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },

  async list() {
    const response = await fetch('/api/v1/creatives', {
      method: 'GET',
      credentials: 'include',
    });
    return parseResponse(response);
  },

  async remove(creativeId: string) {
    const response = await fetch(`/api/v1/creatives/${creativeId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return parseResponse(response);
  },

  async updateStatus(creativeId: string, payload: UpdateCreativeStatusSchemaInput) {
    const response = await fetch(`/api/v1/creatives/${creativeId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },
};
