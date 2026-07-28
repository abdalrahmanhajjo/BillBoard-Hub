import { deviceController } from '@/server/modules/devices/device.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';

type RouteContext = {
  params: Promise<{ deviceId: string }>;
};

/** Revokes a device key; the screen stops being able to report plays immediately. */
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { deviceId } = await params;

    return deviceController.revoke(session.user, deviceId);
  } catch (error) {
    return handleControllerError(error, 'We could not revoke this device key. Try again.');
  }
}
