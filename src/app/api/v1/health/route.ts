import { apiResponse } from '@/server/http/api-response';
import { checkHealth } from '@/server/observability/health';

/** Never serve a cached verdict about whether the app is currently healthy. */
export const dynamic = 'force-dynamic';

export async function GET() {
  const report = await checkHealth();

  // 503 lets a load balancer or uptime monitor act on a failed dependency
  // without parsing the body.
  return apiResponse.ok(report, report.status === 'ok' ? 200 : 503);
}
