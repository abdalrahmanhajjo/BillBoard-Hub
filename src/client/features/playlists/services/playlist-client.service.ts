import { apiRequest } from '@/client/lib/response-utils';
import type {
  CreatePlaylistSchemaInput,
  UpdatePlaylistSchemaInput,
} from '@/shared/contracts/playlist/playlist.schema';

export const playlistClientService = {
  async create(payload: CreatePlaylistSchemaInput) {
    return apiRequest('/api/v1/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },

  async list(billboardId?: string) {
    const query = billboardId ? `?billboardId=${encodeURIComponent(billboardId)}` : '';
    return apiRequest(`/api/v1/playlists${query}`, {
      method: 'GET',
      credentials: 'include',
    });
  },

  async update(playlistId: string, payload: UpdatePlaylistSchemaInput) {
    return apiRequest(`/api/v1/playlists/${playlistId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },

  async remove(playlistId: string) {
    return apiRequest(`/api/v1/playlists/${playlistId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  },
};
