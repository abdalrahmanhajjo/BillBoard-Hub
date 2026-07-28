import type { User } from '@/shared/types/user';
import { assert, can } from '../policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';
import { ForbiddenError } from '@/shared/http/http-error';

export const campaignPolicy = {
  assertCanCreate(actor: User): void {
    assert(actor.role, PERMISSIONS.CAMPAIGNS_CREATE, 'You cannot create campaigns.');
  },
  canReadAny(actor: User): boolean {
    return can(actor.role, PERMISSIONS.CAMPAIGNS_READ_ANY);
  },
  assertCanReadOwn(actor: User, createdBy: string): boolean {
    if (createdBy !== actor.id) {
      throw new ForbiddenError('You cannot view this campaign.');
    }
    assert(actor.role, PERMISSIONS.CAMPAIGNS_READ_SELF, 'You cannot view campaigns.');
    return true;
  },
  assertCanAccess(actor: User, createdBy: string): boolean {
    if (this.canReadAny(actor)) return true;
    return this.assertCanReadOwn(actor, createdBy);
  },
  assertCanUpdate(actor: User, createdBy: string): boolean {
    assert(actor.role, PERMISSIONS.CAMPAIGNS_UPDATE_SELF, 'You cannot update this campaign.');
    if (createdBy !== actor.id) {
      throw new ForbiddenError('You cannot update a campaign you do not own.');
    }
    return true;
  },
  assertCanAssignBillboards(actor: User, createdBy: string): boolean {
    assert(
      actor.role,
      PERMISSIONS.CAMPAIGNS_ASSIGN_BILLBOARDS,
      'You cannot assign billboards to campaigns.',
    );
    if (createdBy !== actor.id) {
      throw new ForbiddenError('You cannot assign billboards to a campaign you do not own.');
    }
    return true;
  },
};
