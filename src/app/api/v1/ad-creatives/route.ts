import { adCreativeController } from '@/server/modules/ad-creatives/ad-creative.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';

// Ad creatives (campaign creatives) live on their own route so they never
// collide with the digital-screen creatives served at /api/v1/creatives.
export async function GET() {
  try {
    const session = await requireSession();
    return adCreativeController.listMyCreatives(session.user);
  } catch (error) {
    return handleControllerError(error, 'Getting ad creatives failed.');
  }
}
