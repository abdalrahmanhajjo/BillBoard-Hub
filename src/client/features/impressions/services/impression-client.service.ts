import type { RecordImpressionSchemaInput } from '@/shared/contracts/impression/impression.schema';
import { apiRequest } from '@/client/ui/lib/api-client';

type AnalyticsFilter = {
  billboardId?: string;
  creativeId?: string;
  playlistId?: string;
};

export const impressionClientService = {
  /** Device contract: record that a creative played on a screen. */
  async record(billboardId: string, payload: RecordImpressionSchemaInput) {
    return apiRequest(`/api/v1/public/screens/${encodeURIComponent(billboardId)}/impressions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },

  async getAnalytics(filter: AnalyticsFilter = {}) {
    const params = new URLSearchParams();
    if (filter.billboardId) params.set('billboardId', filter.billboardId);
    if (filter.creativeId) params.set('creativeId', filter.creativeId);
    if (filter.playlistId) params.set('playlistId', filter.playlistId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/api/v1/impressions${query}`, {
      method: 'GET',
      credentials: 'include',
    });
  },
};
