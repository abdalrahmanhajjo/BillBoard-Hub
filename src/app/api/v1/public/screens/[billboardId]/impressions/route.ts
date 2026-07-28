import { impressionController } from '@/server/modules/impressions/impression.controller';
import { handleControllerError } from '@/server/http/controller-utils';
import type { RecordImpressionSchemaInput } from '@/shared/contracts/impression/impression.schema';

type RouteContext = {
  params: Promise<{ billboardId: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { billboardId } = await params;
    const payload = (await request.json()) as RecordImpressionSchemaInput;

    return impressionController.recordImpression(billboardId, payload);
  } catch (error) {
    return handleControllerError(error, 'We could not record this impression. Try again.');
  }
}
