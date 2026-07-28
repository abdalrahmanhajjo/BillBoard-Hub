import { apiResponse } from '@/server/http/api-response';
import { handleControllerError, validationMessage } from '@/server/http/controller-utils';
import { adCreativeService } from '@/server/modules/ad-creatives/ad-creative.service';
import {
  createAdCreativeSchema,
  type CreateAdCreativeSchemaInput,
} from '@/shared/contracts/ad-creative/ad-creative.schema';
import type { User } from '@/shared/types/user';

export const adCreativeController = {
  async createCreative(payload: CreateAdCreativeSchemaInput, actor: User) {
    const parsed = createAdCreativeSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid ad creative data.'),
      );
    }
    try {
      const creative = await adCreativeService.create(actor, parsed.data);
      return apiResponse.ok(creative, 201);
    } catch (error) {
      return handleControllerError(error, 'Uploading ad creative failed.');
    }
  },

  async listCreatives(actor: User, campaignId: string) {
    if (!campaignId) {
      return apiResponse.badRequest('Campaign id is required.');
    }
    try {
      const creatives = await adCreativeService.listByCampaign(actor, campaignId);
      return apiResponse.ok({ creatives });
    } catch (error) {
      return handleControllerError(error, 'Getting ad creatives failed.');
    }
  },

  async deleteCreative(actor: User, creativeId: string) {
    if (!creativeId) {
      return apiResponse.badRequest('Creative id is required.');
    }
    try {
      await adCreativeService.delete(actor, creativeId);
      return apiResponse.success();
    } catch (error) {
      return handleControllerError(error, 'Deleting ad creative failed.');
    }
  },
  async listMyCreatives(actor: User) {
    try {
      const creatives = await adCreativeService.listMine(actor);
      return apiResponse.ok({ creatives });
    } catch (error) {
      return handleControllerError(error, 'Getting ad creatives failed.');
    }
  },
};
