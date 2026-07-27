import type { User } from '@/shared/types/user';
import { assert } from '../policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';

export const impressionPolicy = {
  assertCanRead(actor: User): void {
    assert(actor.role, PERMISSIONS.IMPRESSIONS_READ, 'You cannot view impression analytics.');
  },
};
