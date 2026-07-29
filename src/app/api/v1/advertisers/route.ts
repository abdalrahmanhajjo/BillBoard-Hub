import { advertiserProfileController } from '@/server/modules/advertiser/advertiser.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { CreateAdvertiserSchemaInput } from '@/shared/contracts/advertiser/advertiser.schema';

export async function GET() {
  try {
    const session = await requireSession();
    return advertiserProfileController.listAdvertiser(session.user);
  } catch (error) {
    return handleControllerError(error, 'Getting advertisers failed.');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const payload = (await request.json()) as CreateAdvertiserSchemaInput;

    return advertiserProfileController.createAdvertiserProfile(payload, session.user);
  } catch (error) {
    return handleControllerError(error, 'Advertiser creation failed.');
  }
}
