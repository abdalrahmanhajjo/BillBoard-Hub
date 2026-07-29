export const AD_CREATIVE_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
} as const;

export const CREATIVE_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

/** Digital billboard video creatives must be strictly shorter than this limit. */
export const MAX_CREATIVE_VIDEO_DURATION_SECONDS = 10;
