import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { deviceRepository } from '@/server/modules/devices/device.repository';
import { billboardRepository } from '@/server/modules/billboards/billboard.repository';
import { authorizationPolicy } from '@/shared/policies';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '@/shared/http/http-error';
import type { DeviceDocument } from '@/server/modules/devices/device.model';
import type { User } from '@/shared/types/user';

/** Header a screen presents on every request. */
export const DEVICE_KEY_HEADER = 'x-device-key';

const KEY_PREFIX = 'bdv_';
const INVALID_DEVICE_MESSAGE = 'This screen is not registered or its key has been revoked.';

function hashKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Constant-time comparison of two hex digests, so a caller cannot learn how much
 * of a guessed key was correct from response timing.
 */
function digestsMatch(left: string, right: string): boolean {
  const a = Buffer.from(left, 'hex');
  const b = Buffer.from(right, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

export const deviceService = {
  /**
   * Issues a device key for a screen. The raw key is returned exactly once —
   * only its digest is persisted, so a database leak cannot be replayed against
   * the ingest endpoint.
   */
  async issueKey(
    actor: User,
    input: { billboardId: string; name: string },
  ): Promise<{ device: DeviceDocument; deviceKey: string }> {
    // Registering hardware is an inventory operation, so it reuses the
    // billboard-management permission rather than inventing a parallel one.
    authorizationPolicy.billboard.assertCanUpdate(actor);

    const billboard = await billboardRepository.findById(input.billboardId);
    if (!billboard) {
      throw new NotFoundError('We could not find this billboard. It may have been removed.');
    }

    const deviceKey = `${KEY_PREFIX}${randomBytes(32).toString('base64url')}`;
    const device = await deviceRepository.create({
      billboardId: input.billboardId,
      name: input.name,
      keyHash: hashKey(deviceKey),
      isActive: true,
      createdBy: actor.id,
    });

    return { device, deviceKey };
  },

  /**
   * Authenticates a screen and proves it belongs to the billboard it is posting
   * about. Without the second check a valid key from any screen could be used to
   * inject plays against every other board.
   */
  async authenticate(request: Request, billboardId: string): Promise<DeviceDocument> {
    const presented = request.headers.get(DEVICE_KEY_HEADER)?.trim();
    if (!presented) {
      throw new UnauthorizedError('This screen must present a device key.');
    }

    const device = await deviceRepository.findActiveByKeyHash(hashKey(presented));
    if (!device || !digestsMatch(device.keyHash, hashKey(presented))) {
      throw new UnauthorizedError(INVALID_DEVICE_MESSAGE);
    }

    if (device.billboardId !== billboardId) {
      throw new ForbiddenError('This device key is registered to a different screen.');
    }

    // Heartbeat is advisory; a failure here must not reject a valid play.
    void deviceRepository.touchLastSeen(String(device._id)).catch(() => undefined);

    return device;
  },

  async revoke(actor: User, deviceId: string): Promise<void> {
    authorizationPolicy.billboard.assertCanUpdate(actor);

    const revoked = await deviceRepository.revoke(deviceId);
    if (!revoked) {
      throw new NotFoundError('We could not find this device.');
    }
  },

  async listForBillboard(actor: User, billboardId: string): Promise<DeviceDocument[]> {
    authorizationPolicy.billboard.assertCanUpdate(actor);
    return deviceRepository.findByBillboardId(billboardId);
  },
};
