import { scheduleController } from '@/server/modules/schedules/schedule.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { UpdateScheduleSchemaInput } from '@/shared/contracts/schedule/schedule.schema';

type RouteContext = {
  params: Promise<{ scheduleId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { scheduleId } = await params;

    return scheduleController.getSchedule(session.user, scheduleId);
  } catch (error) {
    return handleControllerError(error, 'Getting schedule failed.');
  }
}

async function handleUpdate(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { scheduleId } = await params;
    const payload = (await request.json()) as UpdateScheduleSchemaInput;

    return scheduleController.updateSchedule(session.user, scheduleId, payload);
  } catch (error) {
    return handleControllerError(error, 'Schedule update failed.');
  }
}

export const PATCH = handleUpdate;

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { scheduleId } = await params;

    return scheduleController.deleteSchedule(session.user, scheduleId);
  } catch (error) {
    return handleControllerError(error, 'Deleting schedule failed.');
  }
}
