import { impressionController } from '@/server/modules/impressions/impression.controller';
import { deviceService } from '@/server/modules/devices/device.service';
import { handleControllerError } from '@/server/http/controller-utils';
import { apiResponse } from '@/server/http/api-response';
import { checkRateLimit, requestClientKey } from '@/server/http/rate-limit';
import type { RecordImpressionSchemaInput } from '@/shared/contracts/impression/impression.schema';

type RouteContext = {
  params: Promise<{ billboardId: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { billboardId } = await params;

    // Impression counts feed advertiser reporting, so ingestion is
    // authenticated: the device key proves the caller is a registered screen,
    // and that it is the screen it claims to be posting about.
    await deviceService.authenticate(request, billboardId);

    // A compromised or faulty screen still cannot flood the counts. Keyed per
    // screen rather than per IP, since many screens can share an uplink.
    const limit = await checkRateLimit(
      `screen-impressions:${billboardId}:${requestClientKey(request)}`,
      600,
      60_000,
    );
    if (!limit.allowed) {
      return apiResponse.error('Too many impressions reported. Slow down.', 429, {
        retryAfterSeconds: limit.retryAfterSeconds,
      });
    }

    const payload = (await request.json()) as RecordImpressionSchemaInput;

    return impressionController.recordImpression(billboardId, payload);
  } catch (error) {
    return handleControllerError(error, 'We could not record this impression. Try again.');
  }
}
