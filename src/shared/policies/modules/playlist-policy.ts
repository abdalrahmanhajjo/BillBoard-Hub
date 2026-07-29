import type { User } from '@/shared/types/user';
import { assert } from '../policy-utils';
import { PERMISSIONS } from '@/shared/constants/permissions/permissions';
import { permissionDenied } from '@/shared/messages/user-messages';

export const playlistPolicy = {
  assertCanCreate(actor: User): void {
    assert(actor.role, PERMISSIONS.PLAYLISTS_CREATE, permissionDenied('create playlists'));
  },

  assertCanRead(actor: User): void {
    assert(actor.role, PERMISSIONS.PLAYLISTS_READ, permissionDenied('view playlists'));
  },

  assertCanUpdate(actor: User): void {
    assert(actor.role, PERMISSIONS.PLAYLISTS_UPDATE, permissionDenied('edit playlists'));
  },

  assertCanDelete(actor: User): void {
    assert(actor.role, PERMISSIONS.PLAYLISTS_DELETE, permissionDenied('delete playlists'));
  },
};
