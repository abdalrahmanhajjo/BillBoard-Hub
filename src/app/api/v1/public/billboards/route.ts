import { billboardController } from '@/server/modules/billboards/billboard.controller';
import { handleControllerError } from '@/server/http/controller-utils';

export async function GET() {
  try {
    return billboardController.listPublicBillboards();
  } catch (error) {
    return handleControllerError(error, 'Getting billboards failed.');
  }
}
