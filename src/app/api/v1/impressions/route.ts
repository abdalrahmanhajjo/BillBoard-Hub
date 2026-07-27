import { impressionController } from '@/server/modules/impressions/impression.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(request.url);
    const filter = {
      billboardId: searchParams.get('billboardId')?.trim() || undefined,
      creativeId: searchParams.get('creativeId')?.trim() || undefined,
      playlistId: searchParams.get('playlistId')?.trim() || undefined,
    };

    return impressionController.getAnalytics(session.user, filter);
  } catch (error) {
    return handleControllerError(error, 'Getting impression analytics failed.');
  }
}
