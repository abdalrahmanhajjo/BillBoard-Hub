import { apiResponse } from '@/server/http/api-response';
import { handleControllerError, validationMessage } from '@/server/http/controller-utils';
import { impressionService } from '@/server/modules/impressions/impression.service';
import type { ImpressionFilter } from '@/server/modules/impressions/impression.repository';
import {
  recordImpressionSchema,
  type RecordImpressionSchemaInput,
} from '@/shared/contracts/impression/impression.schema';
import type { User } from '@/shared/types/user';

export const impressionController = {
  async recordImpression(billboardId: string, payload: RecordImpressionSchemaInput) {
    if (!billboardId) {
      return apiResponse.badRequest('Billboard id is required.');
    }

    const parsed = recordImpressionSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid impression data.'),
      );
    }

    try {
      const impression = await impressionService.record(billboardId, parsed.data);
      return apiResponse.ok(impression, 201);
    } catch (error) {
      return handleControllerError(error, 'Recording impression failed.');
    }
  },

  async getAnalytics(actor: User, filter: ImpressionFilter) {
    try {
      const analytics = await impressionService.getAnalytics(actor, filter);
      return apiResponse.ok(analytics);
    } catch (error) {
      return handleControllerError(error, 'Getting impression analytics failed.');
    }
  },
};
