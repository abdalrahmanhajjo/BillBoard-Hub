import { adCreativeController } from '@/server/modules/ad-creatives/ad-creative.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { CreateAdCreativeSchemaInput } from '@/shared/contracts/ad-creative/ad-creative.schema';

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const payload = (await request.json()) as CreateAdCreativeSchemaInput;

    return adCreativeController.createCreative(payload, session.user);
  } catch (error) {
    return handleControllerError(error, 'Creative creation failed.');
  }
}
