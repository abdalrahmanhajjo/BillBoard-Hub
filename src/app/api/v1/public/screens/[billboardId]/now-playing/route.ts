import { rotationController } from '@/server/modules/rotation/rotation.controller';
import { handleControllerError } from '@/server/http/controller-utils';

type RouteContext = {
  params: Promise<{ billboardId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { billboardId } = await params;

    return rotationController.getNowPlaying(billboardId);
  } catch (error) {
    return handleControllerError(error, 'We could not load the current playback. Try again.');
  }
}
