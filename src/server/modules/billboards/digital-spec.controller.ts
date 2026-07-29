import { apiResponse } from '@/server/http/api-response';
import { handleControllerError, validationMessage } from '@/server/http/controller-utils';
import { digitalSpecService } from '@/server/modules/billboards/digital-spec.service';
import {
  upsertDigitalSpecSchema,
  type UpsertDigitalSpecSchemaInput,
} from '@/shared/contracts/billboard/digital-spec.schema';
import type { User } from '@/shared/types/user';

export const digitalSpecController = {
  async getDigitalSpec(actor: User, billboardId: string) {
    if (!billboardId) {
      return apiResponse.badRequest('Billboard id is required.');
    }

    try {
      const spec = await digitalSpecService.getByBillboard(actor, billboardId);

      return apiResponse.ok({ spec });
    } catch (error) {
      return handleControllerError(
        error,
        'We could not load the digital specifications. Try again.',
      );
    }
  },

  async getPublicDigitalSpec(billboardId: string) {
    if (!billboardId) {
      return apiResponse.badRequest('Billboard id is required.');
    }

    try {
      const spec = await digitalSpecService.getPublicByBillboard(billboardId);

      return apiResponse.ok({ spec });
    } catch (error) {
      return handleControllerError(
        error,
        'We could not load the digital specifications. Try again.',
      );
    }
  },

  async upsertDigitalSpec(actor: User, billboardId: string, payload: UpsertDigitalSpecSchemaInput) {
    if (!billboardId) {
      return apiResponse.badRequest('Billboard id is required.');
    }

    const parsed = upsertDigitalSpecSchema.safeParse(payload);

    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid digital specification data.'),
      );
    }

    try {
      const spec = await digitalSpecService.upsertForBillboard(actor, billboardId, parsed.data);

      return apiResponse.ok(spec);
    } catch (error) {
      return handleControllerError(
        error,
        'We could not save the digital specifications. Review the values and try again.',
      );
    }
  },
};
