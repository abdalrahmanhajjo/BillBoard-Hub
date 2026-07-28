import type { RecordImpressionSchemaInput } from '@/shared/contracts/impression/impression.schema';
import { parseResponse } from '@/client/lib/response-utils';

type AnalyticsFilter = {
  billboardId?: string;
  creativeId?: string;
  playlistId?: string;
};

export const impressionClientService = {
  /** Device contract: record that a creative played on a screen. */
  async record(billboardId: string, payload: RecordImpressionSchemaInput) {
    const response = await fetch(
      `/api/v1/public/screens/${encodeURIComponent(billboardId)}/impressions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      },
    );
    return parseResponse(response);
  },

  async getAnalytics(filter: AnalyticsFilter = {}) {
    const params = new URLSearchParams();
    if (filter.billboardId) params.set('billboardId', filter.billboardId);
    if (filter.creativeId) params.set('creativeId', filter.creativeId);
    if (filter.playlistId) params.set('playlistId', filter.playlistId);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`/api/v1/impressions${query}`, {
      method: 'GET',
      credentials: 'include',
    });
    return parseResponse(response);
  },
};
