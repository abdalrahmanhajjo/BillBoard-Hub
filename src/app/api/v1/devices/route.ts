import { deviceController } from '@/server/modules/devices/device.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import { apiResponse } from '@/server/http/api-response';
import { USER_MESSAGES } from '@/shared/messages/user-messages';
import type { IssueDeviceKeySchemaInput } from '@/shared/contracts/device/device.schema';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const billboardId = new URL(request.url).searchParams.get('billboardId')?.trim();

    if (!billboardId) {
      return apiResponse.badRequest('Choose a screen before listing its devices.');
    }

    return deviceController.listForBillboard(session.user, billboardId);
  } catch (error) {
    return handleControllerError(error, 'We could not load devices. Try again.');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const payload = (await request.json()) as IssueDeviceKeySchemaInput;

    return deviceController.issueKey(session.user, payload);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiResponse.badRequest(USER_MESSAGES.invalidJson);
    }
    return handleControllerError(error, 'We could not register this device. Try again.');
  }
}
