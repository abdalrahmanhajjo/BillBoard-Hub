import type {
  CreatePlaylistSchemaInput,
  UpdatePlaylistSchemaInput,
} from '@/shared/contracts/playlist/playlist.schema';

async function parseResponse(response: Response) {
  const payload = await response.json();
  if (!response.ok) {
    return { ok: false, error: payload?.error ?? 'Request failed.', data: payload?.data };
  }
  return { ok: payload?.ok ?? true, error: payload?.error, data: payload?.data };
}

export const playlistClientService = {
  async create(payload: CreatePlaylistSchemaInput) {
    const response = await fetch('/api/v1/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },

  async list(billboardId?: string) {
    const query = billboardId ? `?billboardId=${encodeURIComponent(billboardId)}` : '';
    const response = await fetch(`/api/v1/playlists${query}`, {
      method: 'GET',
      credentials: 'include',
    });
    return parseResponse(response);
  },

  async update(playlistId: string, payload: UpdatePlaylistSchemaInput) {
    const response = await fetch(`/api/v1/playlists/${playlistId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },

  async remove(playlistId: string) {
    const response = await fetch(`/api/v1/playlists/${playlistId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return parseResponse(response);
  },
};
