import { rotationController } from '@/server/modules/rotation/rotation.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';

type RouteContext = {
  params: Promise<{ scheduleId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { scheduleId } = await params;

    return rotationController.getScheduleRotation(session.user, scheduleId);
  } catch (error) {
    return handleControllerError(error, 'Getting rotation failed.');
  }
}
