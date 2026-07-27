import type { User } from '@/shared/types/user';
import { assert } from '../policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';

export const playlistPolicy = {
  assertCanCreate(actor: User): void {
    assert(actor.role, PERMISSIONS.PLAYLISTS_CREATE, 'You cannot create playlists.');
  },

  assertCanRead(actor: User): void {
    assert(actor.role, PERMISSIONS.PLAYLISTS_READ, 'You cannot view playlists.');
  },

  assertCanUpdate(actor: User): void {
    assert(actor.role, PERMISSIONS.PLAYLISTS_UPDATE, 'You cannot update playlists.');
  },

  assertCanDelete(actor: User): void {
    assert(actor.role, PERMISSIONS.PLAYLISTS_DELETE, 'You cannot delete playlists.');
  },
};
