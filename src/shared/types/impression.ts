export type Impression = {
  id: string;
  billboardId: string;
  playlistId: string;
  creativeId: string;
  scheduleId?: string;
  /** UTC ISO timestamp the impression occurred (when the creative played). */
  occurredAt: string;
  createdAt?: string;
};

type CreativeImpressionStat = {
  creativeId: string;
  name: string;
  count: number;
};

export type ImpressionAnalytics = {
  total: number;
  byCreative: CreativeImpressionStat[];
  recent: Impression[];
};
