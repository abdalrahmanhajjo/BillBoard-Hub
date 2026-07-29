import { adCreativeController } from '@/server/modules/ad-creatives/ad-creative.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { CreateAdCreativeSchemaInput } from '@/shared/contracts/ad-creative/ad-creative.schema';

export async function GET() {
  try {
    const session = await requireSession();

    return adCreativeController.listCreatives(session.user);
  } catch (error) {
    return handleControllerError(error, 'We could not load creatives. Try again.');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const payload = (await request.json()) as CreateAdCreativeSchemaInput;

    return adCreativeController.createCreative(payload, session.user);
  } catch (error) {
    return handleControllerError(
      error,
      'We could not add this creative. Review the details and try again.',
    );
  }
}
