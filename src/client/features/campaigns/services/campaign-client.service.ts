import { parseResponse } from '@/client/lib/response-utils';
import type {
  CreateCampaignSchemaInput,
  UpdateCampaignSchemaInput,
} from '@/shared/contracts/campaign/campaign.schema';
import type { AssignBillboardsSchemaInput } from '@/shared/contracts/campaign/campaign-billboard.schema';

export const campaignClientService = {
  async create(payload: CreateCampaignSchemaInput) {
    const response = await fetch('/api/v1/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },
  async list() {
    const response = await fetch('/api/v1/campaigns', {
      method: 'GET',
      credentials: 'include',
    });
    return parseResponse(response);
  },
  async get(campaignId: string) {
    const response = await fetch(`/api/v1/campaigns/${campaignId}`, {
      method: 'GET',
      credentials: 'include',
    });
    return parseResponse(response);
  },
  async update(campaignId: string, payload: UpdateCampaignSchemaInput) {
    const response = await fetch(`/api/v1/campaigns/${campaignId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },
  async assignBillboards(campaignId: string, payload: AssignBillboardsSchemaInput) {
    const response = await fetch(`/api/v1/campaigns/${campaignId}/billboards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },
  async listAssignedBillboards(campaignId: string) {
    const response = await fetch(`/api/v1/campaigns/${campaignId}/billboards`, {
      method: 'GET',
      credentials: 'include',
    });
    return parseResponse(response);
  },
};
