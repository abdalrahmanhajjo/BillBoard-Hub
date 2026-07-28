import { creativeController } from '@/server/modules/creatives/creative.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { CreateCreativeSchemaInput } from '@/shared/contracts/creative/creative.schema';

export async function GET() {
  try {
    const session = await requireSession();

    return creativeController.listCreatives(session.user);
  } catch (error) {
    return handleControllerError(error, 'We could not load creatives. Try again.');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const payload = (await request.json()) as CreateCreativeSchemaInput;

    return creativeController.createCreative(payload, session.user);
  } catch (error) {
    return handleControllerError(
      error,
      'We could not add this creative. Review the details and try again.',
    );
  }
}
