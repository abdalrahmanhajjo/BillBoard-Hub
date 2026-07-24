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

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(request.url);
    const rawQuery = Object.fromEntries(
      Array.from(searchParams.entries()).filter(([, value]) => value.trim() !== ''),
    );
    return billboardController.listBillboards(session.user, rawQuery);
  } catch (error) {
    return handleControllerError(error, 'Getting billboards failed.');
  }
}
