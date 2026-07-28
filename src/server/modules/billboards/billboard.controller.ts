import { apiResponse } from '@/server/http/api-response';
import { handleControllerError, validationMessage } from '@/server/http/controller-utils';
import { billboardService } from '@/server/modules/billboards/billboard.service';
import {
  createBillboardSchema,
  updateBillboardSchema,
  type CreateBillboardSchemaInput,
  type UpdateBillboardSchemaInput,
} from '@/shared/contracts/billboard/billboard.schema';
import { billboardQuerySchema } from '@/shared/contracts/billboard/billboard-query.schema';
import {
  updateAvailabilitySchema,
  type UpdateAvailabilitySchemaInput,
} from '@/shared/contracts/billboard/availability.schema';
import type { User } from '@/shared/types/user';

export const billboardController = {
  async createBillboard(payload: CreateBillboardSchemaInput, actor: User) {
    const parsed = createBillboardSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid billboard data.'),
      );
    }
    try {
      const billboard = await billboardService.create(parsed.data, actor);
      return apiResponse.ok(billboard, 201);
    } catch (error) {
      return handleControllerError(
        error,
        'We could not create this billboard. Review the details and try again.',
      );
    }
  },
  async listBillboards(actor: User, rawQuery: unknown = {}) {
    const parsed = billboardQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid search or filter parameters.'),
      );
    }
    try {
      const billboards = await billboardService.list(actor, parsed.data);
      return apiResponse.ok({ billboards });
    } catch (error) {
      return handleControllerError(error, 'We could not load billboard inventory. Try again.');
    }
  },

  async listPublicBillboards() {
    try {
      const billboards = await billboardService.listPublic();

      return apiResponse.ok({ billboards });
    } catch (error) {
      return handleControllerError(error, 'We could not load billboard inventory. Try again.');
    }
  },

  async getPublicBillboard(billboardId: string) {
    if (!billboardId) {
      return apiResponse.badRequest('Billboard id is required.');
    }

    try {
      const billboard = await billboardService.getPublicById(billboardId);

      return apiResponse.ok({ billboard });
    } catch (error) {
      return handleControllerError(error, 'We could not load this billboard. Try again.');
    }
  },

  async getBillboard(actor: User, billboardId: string) {
    if (!billboardId) {
      return apiResponse.badRequest('Billboard id is required.');
    }
    try {
      const billboard = await billboardService.getById(actor, billboardId);
      return apiResponse.ok({ billboard });
    } catch (error) {
      return handleControllerError(error, 'We could not load this billboard. Try again.');
    }
  },
  async updateBillboard(actor: User, billboardId: string, payload: UpdateBillboardSchemaInput) {
    if (!billboardId) {
      return apiResponse.badRequest('Billboard id is required.');
    }
    const parsed = updateBillboardSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid billboard data.'),
      );
    }
    try {
      const billboard = await billboardService.update(actor, billboardId, parsed.data);
      return apiResponse.ok(billboard);
    } catch (error) {
      return handleControllerError(
        error,
        'We could not save the billboard changes. Review the details and try again.',
      );
    }
  },
  async updateAvailability(
    actor: User,
    billboardId: string,
    payload: UpdateAvailabilitySchemaInput,
  ) {
    if (!billboardId) {
      return apiResponse.badRequest('Billboard id is required.');
    }
    const parsed = updateAvailabilitySchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid availability status.'),
      );
    }
    try {
      const billboard = await billboardService.updateAvailability(
        actor,
        billboardId,
        parsed.data.status,
      );
      return apiResponse.ok(billboard);
    } catch (error) {
      return handleControllerError(
        error,
        'We could not update availability. Refresh and try again.',
      );
    }
  },

  async deleteBillboard(actor: User, billboardId: string) {
    if (!billboardId) {
      return apiResponse.badRequest('Billboard id is required.');
    }

    try {
      await billboardService.delete(actor, billboardId);
      return apiResponse.ok({ deleted: true });
    } catch (error) {
      return handleControllerError(
        error,
        'We could not archive this billboard. Refresh and try again.',
      );
    }
  },
};
