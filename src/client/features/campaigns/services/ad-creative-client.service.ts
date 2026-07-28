import type { CreateAdCreativeSchemaInput } from '@/shared/contracts/ad-creative/ad-creative.schema';
import { apiRequest } from '@/client/lib/response-utils';

export const adCreativeClientService = {
  async getUploadAuthParams() {
    return apiRequest('/api/v1/uploads/imagekit-auth', {
      method: 'GET',
      credentials: 'include',
    });
  },
  async create(campaignId: string, payload: CreateAdCreativeSchemaInput) {
    return apiRequest(`/api/v1/campaigns/${encodeURIComponent(campaignId)}/creatives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },
  async listByCampaign(campaignId: string) {
    return apiRequest(`/api/v1/campaigns/${encodeURIComponent(campaignId)}/creatives`, {
      method: 'GET',
      credentials: 'include',
    });
  },
  async delete(creativeId: string) {
    return apiRequest(`/api/v1/ad-creatives/${encodeURIComponent(creativeId)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  },
  async listMine() {
    return apiRequest('/api/v1/ad-creatives', {
      method: 'GET',
      credentials: 'include',
    });
  },
};
