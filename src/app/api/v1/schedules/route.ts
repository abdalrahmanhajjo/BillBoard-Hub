import { scheduleController } from '@/server/modules/schedules/schedule.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { CreateScheduleSchemaInput } from '@/shared/contracts/schedule/schedule.schema';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(request.url);
    const billboardId = searchParams.get('billboardId')?.trim() || undefined;

    return scheduleController.listSchedules(session.user, billboardId);
  } catch (error) {
    return handleControllerError(error, 'Getting schedules failed.');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const payload = (await request.json()) as CreateScheduleSchemaInput;

    return scheduleController.createSchedule(payload, session.user);
  } catch (error) {
    return handleControllerError(error, 'Schedule creation failed.');
  }
}
