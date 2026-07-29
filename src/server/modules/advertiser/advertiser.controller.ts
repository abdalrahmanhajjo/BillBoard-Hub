import { apiResponse } from '@/server/http/api-response';
import { handleControllerError, validationMessage } from '@/server/http/controller-utils';
import { advertiserService } from '@/server/modules/advertiser/advertiser.service';
import {
  type CreateAdvertiserSchemaInput,
  type UpdateAdvertiserSchemaInput,
  createAdvertiserSchema,
  updateAdvertiserSchema,
} from '@/shared/contracts/advertiser/advertiser.schema';
import type { User } from '@/shared/types/user';

export const advertiserProfileController = {
  async createAdvertiserProfile(payload: CreateAdvertiserSchemaInput, actor: User) {
    const parsed = createAdvertiserSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid advertiser profile data.'),
      );
    }
    try {
      const profile = await advertiserService.create(actor, parsed.data);
      return apiResponse.ok(profile, 201);
    } catch (error) {
      return handleControllerError(error, 'Creating advertiser profile failed.');
    }
  },

  async listAdvertiser(actor: User) {
    try {
      const advertisers = await advertiserService.list(actor);
      return apiResponse.ok({ advertisers });
    } catch (error) {
      return handleControllerError(error, 'Getting advertisers failed.');
    }
  },

  async getAdvertiser(actor: User, advertiserId: string) {
    if (!advertiserId) {
      return apiResponse.badRequest('Advertiser id is required.');
    }

    try {
      const advertiser = await advertiserService.getById(actor, advertiserId);
      return apiResponse.ok({ advertiser });
    } catch (error) {
      return handleControllerError(error, 'Getting advertiser failed.');
    }
  },

  async deleteAdvertiser(actor: User, advertiserId: string) {
    if (!advertiserId) {
      return apiResponse.badRequest('Advertiser id is required.');
    }
    try {
      await advertiserService.delete(actor, advertiserId);
      return apiResponse.success();
    } catch (error) {
      return handleControllerError(error, 'Deleting advertiser failed.');
    }
  },

  async updateAdvertiser(actor: User, advertiserId: string, payload: UpdateAdvertiserSchemaInput) {
    if (!advertiserId) {
      return apiResponse.badRequest('Advertiser id is required.');
    }

    const parsed = updateAdvertiserSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid advertiser profile data.'),
      );
    }

    try {
      const advertiser = await advertiserService.update(actor, advertiserId, parsed.data);
      return apiResponse.ok(advertiser);
    } catch (error) {
      return handleControllerError(error, 'Updating advertiser profile failed.');
    }
  },
};
