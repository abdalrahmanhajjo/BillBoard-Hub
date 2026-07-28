import { apiResponse } from '@/server/http/api-response';
import { handleControllerError, validationMessage } from '@/server/http/controller-utils';
import { creativeService } from '@/server/modules/creatives/creative.service';
import {
  createCreativeSchema,
  updateCreativeSchema,
  updateCreativeStatusSchema,
  type CreateCreativeSchemaInput,
  type UpdateCreativeSchemaInput,
  type UpdateCreativeStatusSchemaInput,
} from '@/shared/contracts/creative/creative.schema';
import type { User } from '@/shared/types/user';

export const creativeController = {
  async createCreative(payload: CreateCreativeSchemaInput, actor: User) {
    const parsed = createCreativeSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid creative data.'),
      );
    }

    try {
      const creative = await creativeService.create(parsed.data, actor);
      return apiResponse.ok(creative, 201);
    } catch (error) {
      return handleControllerError(
        error,
        'We could not add this creative. Review the details and try again.',
      );
    }
  },

  async listCreatives(actor: User) {
    try {
      const creatives = await creativeService.list(actor);
      return apiResponse.ok({ creatives });
    } catch (error) {
      return handleControllerError(error, 'We could not load creatives. Try again.');
    }
  },

  async getCreative(actor: User, creativeId: string) {
    if (!creativeId) {
      return apiResponse.badRequest('Creative id is required.');
    }

    try {
      const creative = await creativeService.getById(actor, creativeId);
      return apiResponse.ok({ creative });
    } catch (error) {
      return handleControllerError(error, 'We could not load this creative. Try again.');
    }
  },

  async updateCreative(actor: User, creativeId: string, payload: UpdateCreativeSchemaInput) {
    if (!creativeId) {
      return apiResponse.badRequest('Creative id is required.');
    }

    const parsed = updateCreativeSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid creative data.'),
      );
    }

    try {
      const creative = await creativeService.update(actor, creativeId, parsed.data);
      return apiResponse.ok(creative);
    } catch (error) {
      return handleControllerError(error, 'We could not save this creative. Try again.');
    }
  },

  async updateCreativeStatus(
    actor: User,
    creativeId: string,
    payload: UpdateCreativeStatusSchemaInput,
  ) {
    if (!creativeId) {
      return apiResponse.badRequest('Creative id is required.');
    }

    const parsed = updateCreativeStatusSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid creative status.'),
      );
    }

    try {
      const creative = await creativeService.updateStatus(actor, creativeId, parsed.data.status);
      return apiResponse.ok(creative);
    } catch (error) {
      return handleControllerError(error, 'We could not update the creative status. Try again.');
    }
  },

  async deleteCreative(actor: User, creativeId: string) {
    if (!creativeId) {
      return apiResponse.badRequest('Creative id is required.');
    }

    try {
      await creativeService.delete(actor, creativeId);
      return apiResponse.ok({ deleted: true });
    } catch (error) {
      return handleControllerError(
        error,
        'We could not delete this creative. Refresh and try again.',
      );
    }
  },
};
