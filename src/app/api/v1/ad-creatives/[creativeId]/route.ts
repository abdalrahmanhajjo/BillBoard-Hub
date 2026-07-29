import { adCreativeController } from '@/server/modules/ad-creatives/ad-creative.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';

type RouteContext = {
  params: Promise<{ creativeId: string }>;
};

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { creativeId } = await params;
    return adCreativeController.deleteCreative(session.user, creativeId);
  } catch (error) {
    return handleControllerError(error, 'Deleting ad creative failed.');
  }
}
