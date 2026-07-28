import { apiResponse } from '@/server/http/api-response';
import { handleControllerError, validationMessage } from '@/server/http/controller-utils';
import { campaignService } from '@/server/modules/campaigns/campaign.service';
import {
  createCampaignSchema,
  updateCampaignSchema,
  type CreateCampaignSchemaInput,
  type UpdateCampaignSchemaInput,
} from '@/shared/contracts/campaign/campaign.schema';
import {
  assignBillboardsSchema,
  type AssignBillboardsSchemaInput,
} from '@/shared/contracts/campaign/campaign-billboard.schema';
import type { User } from '@/shared/types/user';

export const campaignController = {
  async createCampaign(payload: CreateCampaignSchemaInput, actor: User) {
    const parsed = createCampaignSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid campaign data.'),
      );
    }
    try {
      const campaign = await campaignService.create(parsed.data, actor);
      return apiResponse.ok(campaign, 201);
    } catch (error) {
      return handleControllerError(error, 'Campaign creation failed.');
    }
  },

  async listCampaigns(actor: User) {
    try {
      const campaigns = await campaignService.list(actor);
      return apiResponse.ok({ campaigns });
    } catch (error) {
      return handleControllerError(error, 'Getting campaigns failed.');
    }
  },

  async getCampaign(actor: User, campaignId: string) {
    if (!campaignId) {
      return apiResponse.badRequest('Campaign id is required.');
    }
    try {
      const campaign = await campaignService.getById(actor, campaignId);
      return apiResponse.ok({ campaign });
    } catch (error) {
      return handleControllerError(error, 'Getting campaign failed.');
    }
  },

  async updateCampaign(actor: User, campaignId: string, payload: UpdateCampaignSchemaInput) {
    if (!campaignId) {
      return apiResponse.badRequest('Campaign id is required.');
    }
    const parsed = updateCampaignSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid campaign data.'),
      );
    }
    try {
      const campaign = await campaignService.update(actor, campaignId, parsed.data);
      return apiResponse.ok(campaign);
    } catch (error) {
      return handleControllerError(error, 'Campaign update failed.');
    }
  },

  async assignBillboards(actor: User, campaignId: string, payload: AssignBillboardsSchemaInput) {
    if (!campaignId) {
      return apiResponse.badRequest('Campaign id is required.');
    }
    const parsed = assignBillboardsSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid billboard assignment.'),
      );
    }
    try {
      const billboards = await campaignService.assignBillboards(actor, campaignId, parsed.data);
      return apiResponse.ok({ billboards });
    } catch (error) {
      return handleControllerError(error, 'Assigning billboards failed.');
    }
  },

  async listAssignedBillboards(actor: User, campaignId: string) {
    if (!campaignId) {
      return apiResponse.badRequest('Campaign id is required.');
    }
    try {
      const billboards = await campaignService.listAssignedBillboards(actor, campaignId);
      return apiResponse.ok({ billboards });
    } catch (error) {
      return handleControllerError(error, 'Getting assigned billboards failed.');
    }
  },
};
