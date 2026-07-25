import { DEFAULT_SLOT_SECONDS } from '@/shared/constants/rotation';
import type { Creative } from '@/shared/types/creative';
import type { RotationItem, RotationSummary } from '@/shared/types/rotation';
import type { Playlist } from '@/shared/types/playlist';
import type { Schedule } from '@/shared/types/schedule';

/** Resolves how long a creative stays on screen. */
export function resolveDurationSeconds(creative: Creative): number {
  return creative.durationSeconds && creative.durationSeconds > 0
    ? creative.durationSeconds
    : DEFAULT_SLOT_SECONDS;
}

/**
 * Builds the ordered rotation items from a playlist's creative order. Creatives
 * that no longer exist (deleted after being added) are skipped; positions
 * reflect the surviving play order.
 */
export function buildRotationItems(
  creativeIds: string[],
  creativesById: Map<string, Creative>,
): RotationItem[] {
  const items: RotationItem[] = [];
  for (const creativeId of creativeIds) {
    const creative = creativesById.get(creativeId);
    if (!creative) continue;
    items.push({
      creativeId: creative.id,
      name: creative.name,
      type: creative.type,
      assetUrl: creative.assetUrl,
      durationSeconds: resolveDurationSeconds(creative),
      position: items.length + 1,
    });
  }
  return items;
}

export function buildRotationSummary(
  schedule: Schedule,
  playlist: Playlist,
  creativesById: Map<string, Creative>,
): RotationSummary {
  const items = buildRotationItems(playlist.creativeIds, creativesById);
  const totalDurationSeconds = items.reduce((sum, item) => sum + item.durationSeconds, 0);
  return {
    scheduleId: schedule.id,
    billboardId: schedule.billboardId,
    playlistId: playlist.id,
    playlistName: playlist.name,
    startAt: schedule.startAt,
    endAt: schedule.endAt,
    totalDurationSeconds,
    items,
  };
}
