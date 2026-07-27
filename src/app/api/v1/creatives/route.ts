import { adCreativeController } from '@/server/modules/ad-creatives/ad-creative.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';

export async function GET() {
  try {
    const session = await requireSession();
    return adCreativeController.listMyCreatives(session.user);
  } catch (error) {
    return handleControllerError(error, 'Getting ad creatives failed.');
  }
}
