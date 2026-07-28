import { creativeController } from '@/server/modules/creatives/creative.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { UpdateCreativeSchemaInput } from '@/shared/contracts/creative/creative.schema';

type RouteContext = {
  params: Promise<{ creativeId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { creativeId } = await params;

    return creativeController.getCreative(session.user, creativeId);
  } catch (error) {
    return handleControllerError(error, 'We could not load this creative. Try again.');
  }
}

async function handleUpdate(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { creativeId } = await params;
    const payload = (await request.json()) as UpdateCreativeSchemaInput;

    return creativeController.updateCreative(session.user, creativeId, payload);
  } catch (error) {
    return handleControllerError(error, 'We could not save this creative. Try again.');
  }
}

export const PATCH = handleUpdate;

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { creativeId } = await params;

    return creativeController.deleteCreative(session.user, creativeId);
  } catch (error) {
    return handleControllerError(
      error,
      'We could not delete this creative. Refresh and try again.',
    );
  }
}
