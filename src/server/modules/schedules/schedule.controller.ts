import { apiResponse } from '@/server/http/api-response';
import { handleControllerError, validationMessage } from '@/server/http/controller-utils';
import { scheduleService } from '@/server/modules/schedules/schedule.service';
import {
  createScheduleSchema,
  updateScheduleSchema,
  type CreateScheduleSchemaInput,
  type UpdateScheduleSchemaInput,
} from '@/shared/contracts/schedule/schedule.schema';
import type { User } from '@/shared/types/user';

export const scheduleController = {
  async createSchedule(payload: CreateScheduleSchemaInput, actor: User) {
    const parsed = createScheduleSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid schedule data.'),
      );
    }

    try {
      const schedule = await scheduleService.create(parsed.data, actor);
      return apiResponse.ok(schedule, 201);
    } catch (error) {
      return handleControllerError(
        error,
        'We could not create this schedule. Review the time window and try again.',
      );
    }
  },

  async listSchedules(actor: User, billboardId?: string) {
    try {
      const schedules = await scheduleService.list(actor, billboardId);
      return apiResponse.ok({ schedules });
    } catch (error) {
      return handleControllerError(error, 'We could not load schedules. Try again.');
    }
  },

  async getSchedule(actor: User, scheduleId: string) {
    if (!scheduleId) {
      return apiResponse.badRequest('Schedule id is required.');
    }

    try {
      const schedule = await scheduleService.getById(actor, scheduleId);
      return apiResponse.ok({ schedule });
    } catch (error) {
      return handleControllerError(error, 'We could not load this schedule. Try again.');
    }
  },

  async updateSchedule(actor: User, scheduleId: string, payload: UpdateScheduleSchemaInput) {
    if (!scheduleId) {
      return apiResponse.badRequest('Schedule id is required.');
    }

    const parsed = updateScheduleSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid schedule data.'),
      );
    }

    try {
      const schedule = await scheduleService.update(actor, scheduleId, parsed.data);
      return apiResponse.ok(schedule);
    } catch (error) {
      return handleControllerError(error, 'We could not save this schedule. Try again.');
    }
  },

  async deleteSchedule(actor: User, scheduleId: string) {
    if (!scheduleId) {
      return apiResponse.badRequest('Schedule id is required.');
    }

    try {
      await scheduleService.delete(actor, scheduleId);
      return apiResponse.ok({ deleted: true });
    } catch (error) {
      return handleControllerError(
        error,
        'We could not delete this schedule. Refresh and try again.',
      );
    }
  },
};
