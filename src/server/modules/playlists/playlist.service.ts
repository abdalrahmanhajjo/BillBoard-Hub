import { playlistRepository } from '@/server/modules/playlists/playlist.repository';
import { toPlaylist } from '@/server/modules/playlists/playlist.utils';
import { billboardRepository } from '@/server/modules/billboards/billboard.repository';
import { creativeRepository } from '@/server/modules/creatives/creative.repository';
import { authorizationPolicy } from '@/shared/policies';
import { BadRequestError, NotFoundError } from '@/shared/http/http-error';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import type {
  CreatePlaylistSchemaOutput,
  UpdatePlaylistSchemaOutput,
} from '@/shared/contracts/playlist/playlist.schema';
import type { Playlist } from '@/shared/types/playlist';
import type { User } from '@/shared/types/user';

async function assertDigitalBillboard(billboardId: string): Promise<void> {
  const billboard = await billboardRepository.findById(billboardId);
  if (!billboard) {
    throw new NotFoundError('We could not find this billboard. It may have been removed.');
  }
  if (billboard.type !== BILLBOARD_TYPES.DIGITAL) {
    throw new BadRequestError('Playlists can only be created for digital billboards.');
  }
}

async function assertCreativesExist(creativeIds: string[]): Promise<void> {
  const distinct = [...new Set(creativeIds)];
  const found = await creativeRepository.findByIds(distinct);
  if (found.length !== distinct.length) {
    throw new BadRequestError('One or more selected creatives were not found.');
  }
}

export const playlistService = {
  async create(input: CreatePlaylistSchemaOutput, actor: User): Promise<Playlist> {
    authorizationPolicy.playlist.assertCanCreate(actor);
    await assertDigitalBillboard(input.billboardId);
    await assertCreativesExist(input.creativeIds);

    const created = await playlistRepository.create(input);
    return toPlaylist(created);
  },

  async list(actor: User, billboardId?: string): Promise<Playlist[]> {
    authorizationPolicy.playlist.assertCanRead(actor);
    const playlists = await playlistRepository.findMany(billboardId ? { billboardId } : {});
    return playlists.map(toPlaylist);
  },

  async getById(actor: User, playlistId: string): Promise<Playlist> {
    authorizationPolicy.playlist.assertCanRead(actor);
    const playlist = await playlistRepository.findById(playlistId);
    if (!playlist) {
      throw new NotFoundError('We could not find this playlist. It may have been removed.');
    }
    return toPlaylist(playlist);
  },

  async update(
    actor: User,
    playlistId: string,
    input: UpdatePlaylistSchemaOutput,
  ): Promise<Playlist> {
    authorizationPolicy.playlist.assertCanUpdate(actor);
    if (input.creativeIds) {
      await assertCreativesExist(input.creativeIds);
    }

    const updated = await playlistRepository.updateById(playlistId, input);
    if (!updated) {
      throw new NotFoundError('We could not find this playlist. It may have been removed.');
    }
    return toPlaylist(updated);
  },

  async delete(actor: User, playlistId: string): Promise<void> {
    authorizationPolicy.playlist.assertCanDelete(actor);
    const deleted = await playlistRepository.deleteById(playlistId);
    if (!deleted) {
      throw new NotFoundError('We could not find this playlist. It may have been removed.');
    }
  },
};
