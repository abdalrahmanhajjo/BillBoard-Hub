import { playlistController } from '@/server/modules/playlists/playlist.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { CreatePlaylistSchemaInput } from '@/shared/contracts/playlist/playlist.schema';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(request.url);
    const billboardId = searchParams.get('billboardId')?.trim() || undefined;

    return playlistController.listPlaylists(session.user, billboardId);
  } catch (error) {
    return handleControllerError(error, 'We could not load playlists. Try again.');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const payload = (await request.json()) as CreatePlaylistSchemaInput;

    return playlistController.createPlaylist(payload, session.user);
  } catch (error) {
    return handleControllerError(
      error,
      'We could not create this playlist. Review the selections and try again.',
    );
  }
}
