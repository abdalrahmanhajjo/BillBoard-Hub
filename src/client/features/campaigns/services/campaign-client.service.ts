import { apiRequest } from '@/client/ui/lib/api-client';
import type {
  CreateCampaignSchemaInput,
  ModerateCampaignStatusSchemaInput,
  UpdateCampaignSchemaInput,
} from '@/shared/contracts/campaign/campaign.schema';
import type { AssignBillboardsSchemaInput } from '@/shared/contracts/campaign/campaign-billboard.schema';
import type { Campaign } from '@/shared/types/campaign';

export const campaignClientService = {
  async create(payload: CreateCampaignSchemaInput) {
    return apiRequest('/api/v1/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },
  async list() {
    return apiRequest('/api/v1/campaigns', {
      method: 'GET',
      credentials: 'include',
    });
  },
  async get(campaignId: string) {
    return apiRequest(`/api/v1/campaigns/${campaignId}`, {
      method: 'GET',
      credentials: 'include',
    });
  },
  async update(campaignId: string, payload: UpdateCampaignSchemaInput) {
    return apiRequest(`/api/v1/campaigns/${campaignId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },
  /** Admin-only status change; leaves the campaign's content untouched. */
  async moderateStatus(campaignId: string, payload: ModerateCampaignStatusSchemaInput) {
    return apiRequest<Campaign>(`/api/v1/campaigns/${campaignId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },
  async assignBillboards(campaignId: string, payload: AssignBillboardsSchemaInput) {
    return apiRequest(`/api/v1/campaigns/${campaignId}/billboards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },
  async listAssignedBillboards(campaignId: string) {
    return apiRequest(`/api/v1/campaigns/${campaignId}/billboards`, {
      method: 'GET',
      credentials: 'include',
    });
  },
};
