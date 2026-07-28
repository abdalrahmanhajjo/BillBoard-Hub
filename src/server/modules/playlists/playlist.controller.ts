import { apiResponse } from '@/server/http/api-response';
import { handleControllerError, validationMessage } from '@/server/http/controller-utils';
import { playlistService } from '@/server/modules/playlists/playlist.service';
import {
  createPlaylistSchema,
  updatePlaylistSchema,
  type CreatePlaylistSchemaInput,
  type UpdatePlaylistSchemaInput,
} from '@/shared/contracts/playlist/playlist.schema';
import type { User } from '@/shared/types/user';

export const playlistController = {
  async createPlaylist(payload: CreatePlaylistSchemaInput, actor: User) {
    const parsed = createPlaylistSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid playlist data.'),
      );
    }

    try {
      const playlist = await playlistService.create(parsed.data, actor);
      return apiResponse.ok(playlist, 201);
    } catch (error) {
      return handleControllerError(
        error,
        'We could not create this playlist. Review the selections and try again.',
      );
    }
  },

  async listPlaylists(actor: User, billboardId?: string) {
    try {
      const playlists = await playlistService.list(actor, billboardId);
      return apiResponse.ok({ playlists });
    } catch (error) {
      return handleControllerError(error, 'We could not load playlists. Try again.');
    }
  },

  async getPlaylist(actor: User, playlistId: string) {
    if (!playlistId) {
      return apiResponse.badRequest('Playlist id is required.');
    }

    try {
      const playlist = await playlistService.getById(actor, playlistId);
      return apiResponse.ok({ playlist });
    } catch (error) {
      return handleControllerError(error, 'We could not load this playlist. Try again.');
    }
  },

  async updatePlaylist(actor: User, playlistId: string, payload: UpdatePlaylistSchemaInput) {
    if (!playlistId) {
      return apiResponse.badRequest('Playlist id is required.');
    }

    const parsed = updatePlaylistSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid playlist data.'),
      );
    }

    try {
      const playlist = await playlistService.update(actor, playlistId, parsed.data);
      return apiResponse.ok(playlist);
    } catch (error) {
      return handleControllerError(error, 'We could not save this playlist. Try again.');
    }
  },

  async deletePlaylist(actor: User, playlistId: string) {
    if (!playlistId) {
      return apiResponse.badRequest('Playlist id is required.');
    }

    try {
      await playlistService.delete(actor, playlistId);
      return apiResponse.ok({ deleted: true });
    } catch (error) {
      return handleControllerError(
        error,
        'We could not delete this playlist. Refresh and try again.',
      );
    }
  },
};
