import type { User } from '@/shared/types/user';
import { assert } from '../policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';
import { permissionDenied } from '@/shared/messages/user-messages';

export const impressionPolicy = {
  assertCanRead(actor: User): void {
    assert(actor.role, PERMISSIONS.IMPRESSIONS_READ, permissionDenied('view impression analytics'));
  },
};
