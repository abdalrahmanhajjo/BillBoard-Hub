import { digitalSpecController } from '@/server/modules/billboards/digital-spec.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { UpsertDigitalSpecSchemaInput } from '@/shared/contracts/billboard/digital-spec.schema';

type RouteContext = {
  params: Promise<{ billboardId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { billboardId } = await params;

    return digitalSpecController.getDigitalSpec(session.user, billboardId);
  } catch (error) {
    return handleControllerError(error, 'We could not load the digital specifications. Try again.');
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { billboardId } = await params;
    const payload = (await request.json()) as UpsertDigitalSpecSchemaInput;

    return digitalSpecController.upsertDigitalSpec(session.user, billboardId, payload);
  } catch (error) {
    return handleControllerError(
      error,
      'We could not save the digital specifications. Review the values and try again.',
    );
  }
}
