import { billboardController } from '@/server/modules/billboards/billboard.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { UpdateAvailabilitySchemaInput } from '@/shared/contracts/billboard/availability.schema';

type RouteContext = {
  params: Promise<{ billboardId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { billboardId } = await params;
    const payload = (await request.json()) as UpdateAvailabilitySchemaInput;

    return billboardController.updateAvailability(session.user, billboardId, payload);
  } catch (error) {
    return handleControllerError(error, 'We could not update availability. Refresh and try again.');
  }
}
