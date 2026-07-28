import { deviceService } from '@/server/modules/devices/device.service';
import { apiResponse } from '@/server/http/api-response';
import { handleControllerError, validationMessage } from '@/server/http/controller-utils';
import {
  issueDeviceKeySchema,
  type IssueDeviceKeySchemaInput,
} from '@/shared/contracts/device/device.schema';
import type { DeviceDocument } from '@/server/modules/devices/device.model';
import type { User } from '@/shared/types/user';

/** Never exposes `keyHash`. */
function toDevice(document: DeviceDocument) {
  return {
    id: String(document._id),
    billboardId: document.billboardId,
    name: document.name,
    isActive: document.isActive,
    lastSeenAt: document.lastSeenAt ?? null,
    createdAt: document.createdAt ?? null,
  };
}

export const deviceController = {
  async issueKey(actor: User, payload: IssueDeviceKeySchemaInput) {
    const parsed = issueDeviceKeySchema.safeParse(payload);

    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid device details.'),
      );
    }

    try {
      const { device, deviceKey } = await deviceService.issueKey(actor, parsed.data);

      // The raw key is returned here and nowhere else — only its digest is
      // stored, so it cannot be recovered later.
      return apiResponse.ok(
        {
          device: toDevice(device),
          deviceKey,
          notice: 'Store this key now. It cannot be shown again.',
        },
        201,
      );
    } catch (error) {
      return handleControllerError(error, 'We could not register this device. Try again.');
    }
  },

  async listForBillboard(actor: User, billboardId: string) {
    try {
      const devices = await deviceService.listForBillboard(actor, billboardId);
      return apiResponse.ok({ devices: devices.map(toDevice) });
    } catch (error) {
      return handleControllerError(error, 'We could not load devices for this screen.');
    }
  },

  async revoke(actor: User, deviceId: string) {
    try {
      await deviceService.revoke(actor, deviceId);
      return apiResponse.ok({ revoked: true });
    } catch (error) {
      return handleControllerError(error, 'We could not revoke this device key.');
    }
  },
};
