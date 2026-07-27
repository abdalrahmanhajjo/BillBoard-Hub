import { playlistController } from '@/server/modules/playlists/playlist.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { UpdatePlaylistSchemaInput } from '@/shared/contracts/playlist/playlist.schema';

type RouteContext = {
  params: Promise<{ playlistId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { playlistId } = await params;

    return playlistController.getPlaylist(session.user, playlistId);
  } catch (error) {
    return handleControllerError(error, 'Getting playlist failed.');
  }
}

async function handleUpdate(request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { playlistId } = await params;
    const payload = (await request.json()) as UpdatePlaylistSchemaInput;

    return playlistController.updatePlaylist(session.user, playlistId, payload);
  } catch (error) {
    return handleControllerError(error, 'Playlist update failed.');
  }
}

export const PATCH = handleUpdate;

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireSession();
    const { playlistId } = await params;

    return playlistController.deletePlaylist(session.user, playlistId);
  } catch (error) {
    return handleControllerError(error, 'Deleting playlist failed.');
  }
}
