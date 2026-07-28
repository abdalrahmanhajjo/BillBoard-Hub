import { rotationController } from '@/server/modules/rotation/rotation.controller';
import { deviceService } from '@/server/modules/devices/device.service';
import { handleControllerError } from '@/server/http/controller-utils';
import { apiResponse } from '@/server/http/api-response';
import { checkRateLimit, requestClientKey } from '@/server/http/rate-limit';

type RouteContext = {
  params: Promise<{ billboardId: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { billboardId } = await params;

    // The schedule reveals which advertisers run on a screen and when, which is
    // commercially sensitive, so playback is readable only by the screen it
    // belongs to.
    await deviceService.authenticate(request, billboardId);

    const limit = await checkRateLimit(
      `screen-now-playing:${billboardId}:${requestClientKey(request)}`,
      600,
      60_000,
    );
    if (!limit.allowed) {
      return apiResponse.error('Too many playback requests. Slow down.', 429, {
        retryAfterSeconds: limit.retryAfterSeconds,
      });
    }

    return rotationController.getNowPlaying(billboardId);
  } catch (error) {
    return handleControllerError(error, 'We could not load the current playback. Try again.');
  }
}
