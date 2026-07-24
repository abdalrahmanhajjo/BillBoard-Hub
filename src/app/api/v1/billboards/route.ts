import { billboardController } from '@/server/modules/billboards/billboard.controller';
import { handleControllerError, requireSession } from '@/server/http/controller-utils';
import type { CreateBillboardSchemaInput } from '@/shared/contracts/billboard/billboard.schema';

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const payload = (await request.json()) as CreateBillboardSchemaInput;

    return billboardController.createBillboard(payload, session.user);
  } catch (error) {
    return handleControllerError(error, 'Billboard creation failed.');
  }
}

export async function GET() {
  try {
    const session = await requireSession();

    return billboardController.listBillboards(session.user);
  } catch (error) {
    return handleControllerError(error, 'Getting billboards failed.');
  }
}
