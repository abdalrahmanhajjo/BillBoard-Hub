import type { PlaylistDocument } from '@/server/modules/playlists/playlist.model';
import type { Playlist, PlaylistStatus } from '@/shared/types/playlist';

export function toPlaylist(playlist: PlaylistDocument): Playlist {
  return {
    id: String(playlist._id),
    billboardId: playlist.billboardId,
    name: playlist.name,
    status: playlist.status as PlaylistStatus,
    creativeIds: (playlist.creativeIds ?? []).map(String),
    createdAt: playlist.createdAt ? new Date(playlist.createdAt).toISOString() : undefined,
    updatedAt: playlist.updatedAt ? new Date(playlist.updatedAt).toISOString() : undefined,
  };
}
