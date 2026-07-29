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
    return handleControllerError(error, 'We could not load this schedule. Try again.');
  }
}

async function handleUpdate(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { scheduleId } = await params;
    const payload = (await request.json()) as UpdateScheduleSchemaInput;

    return scheduleController.updateSchedule(session.user, scheduleId, payload);
  } catch (error) {
    return handleControllerError(error, 'We could not save this schedule. Try again.');
  }
}

export const PATCH = handleUpdate;

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { scheduleId } = await params;

    return scheduleController.deleteSchedule(session.user, scheduleId);
  } catch (error) {
    return handleControllerError(
      error,
      'We could not delete this schedule. Refresh and try again.',
    );
  }
}
