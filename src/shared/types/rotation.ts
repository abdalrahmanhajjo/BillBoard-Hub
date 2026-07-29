import type { AdCreativeType } from '@/shared/types/ad-creative';

/** A single creative in a screen's rotation, with its resolved on-screen time. */
export type RotationItem = {
  creativeId: string;
  name: string;
  type: AdCreativeType;
  assetUrl: string;
  durationSeconds: number;
  position: number;
};

/** The ordered creatives a scheduled playlist puts on a screen. */
export type RotationSummary = {
  scheduleId: string;
  billboardId: string;
  playlistId: string;
  playlistName: string;
  startAt: string;
  endAt: string;
  totalDurationSeconds: number;
  items: RotationItem[];
};

/**
 * Device-facing now-playing contract. `rotation` is null when nothing is
 * scheduled to play on the screen at `serverTime`.
 */
export type NowPlaying = {
  playing: boolean;
  billboardId: string;
  serverTime: string;
  rotation: RotationSummary | null;
};
