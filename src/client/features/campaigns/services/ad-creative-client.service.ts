import type { CreateAdCreativeSchemaInput } from '@/shared/contracts/ad-creative/ad-creative.schema';

async function parseResponse(response: Response) {
  const payload = await response.json();
  if (!response.ok) {
    return { ok: false, error: payload?.error ?? 'Request failed.', data: payload?.data };
  }
  return { ok: payload?.ok ?? true, error: payload?.error, data: payload?.data };
}

export const adCreativeClientService = {
  async getUploadAuthParams() {
    const response = await fetch('/api/v1/uploads/imagekit-auth', {
      method: 'GET',
      credentials: 'include',
    });
    return parseResponse(response);
  },
  async create(campaignId: string, payload: CreateAdCreativeSchemaInput) {
    const response = await fetch(`/api/v1/campaigns/${encodeURIComponent(campaignId)}/creatives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },
  async listByCampaign(campaignId: string) {
    const response = await fetch(`/api/v1/campaigns/${encodeURIComponent(campaignId)}/creatives`, {
      method: 'GET',
      credentials: 'include',
    });
    return parseResponse(response);
  },
  async delete(creativeId: string) {
    const response = await fetch(`/api/v1/ad-creatives/${encodeURIComponent(creativeId)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return parseResponse(response);
  },
  async listMine() {
    const response = await fetch('/api/v1/ad-creatives', {
      method: 'GET',
      credentials: 'include',
    });
    return parseResponse(response);
  },
};
