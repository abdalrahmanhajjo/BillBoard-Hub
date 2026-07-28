import { creativeController } from '@/server/modules/creatives/creative.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { UpdateCreativeStatusSchemaInput } from '@/shared/contracts/creative/creative.schema';

type RouteContext = {
  params: Promise<{ creativeId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { creativeId } = await params;
    const payload = (await request.json()) as UpdateCreativeStatusSchemaInput;

    return creativeController.updateCreativeStatus(session.user, creativeId, payload);
  } catch (error) {
    return handleControllerError(error, 'We could not update the creative status. Try again.');
  }
}
