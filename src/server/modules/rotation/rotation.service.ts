import { scheduleRepository } from '@/server/modules/schedules/schedule.repository';
import { toSchedule } from '@/server/modules/schedules/schedule.utils';
import { playlistRepository } from '@/server/modules/playlists/playlist.repository';
import { toPlaylist } from '@/server/modules/playlists/playlist.utils';
import { creativeRepository } from '@/server/modules/creatives/creative.repository';
import { toCreative } from '@/server/modules/creatives/creative.utils';
import { billboardRepository } from '@/server/modules/billboards/billboard.repository';
import { buildRotationSummary } from '@/server/modules/rotation/rotation.utils';
import { authorizationPolicy } from '@/shared/policies';
import { BadRequestError, NotFoundError } from '@/server/http/http-error';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import type { Creative } from '@/shared/types/creative';
import type { NowPlaying, RotationSummary } from '@/shared/types/rotation';
import type { Schedule } from '@/shared/types/schedule';
import type { User } from '@/shared/types/user';

async function loadCreativesById(creativeIds: string[]): Promise<Map<string, Creative>> {
  const distinct = [...new Set(creativeIds)];
  if (distinct.length === 0) {
    return new Map();
  }
  const docs = await creativeRepository.findByIds(distinct);
  return new Map(
    docs.map((doc) => {
      const creative = toCreative(doc);
      return [creative.id, creative];
    }),
  );
}

async function buildSummaryForSchedule(schedule: Schedule): Promise<RotationSummary> {
  const playlistDoc = await playlistRepository.findById(schedule.playlistId);
  if (!playlistDoc) {
    throw new NotFoundError('The scheduled playlist was not found.');
  }
  const playlist = toPlaylist(playlistDoc);
  const creativesById = await loadCreativesById(playlist.creativeIds);
  return buildRotationSummary(schedule, playlist, creativesById);
}

export const rotationService = {
  /**
   * Device contract: what is playing on a screen right now. Public — a screen
   * polls this without a user session, exposing only the same class of data as
   * the public catalog. Returns `playing: false` when nothing is scheduled.
   */
  async getNowPlaying(billboardId: string, at: Date = new Date()): Promise<NowPlaying> {
    const billboard = await billboardRepository.findById(billboardId);
    if (!billboard) {
      throw new NotFoundError('Billboard not found.');
    }
    if (billboard.type !== BILLBOARD_TYPES.DIGITAL) {
      throw new BadRequestError('Only digital billboards have a rotation.');
    }

    const serverTime = at.toISOString();
    const active = await scheduleRepository.findActiveAt(billboardId, at);
    if (active.length === 0) {
      return { playing: false, billboardId, serverTime, rotation: null };
    }

    const rotation = await buildSummaryForSchedule(toSchedule(active[0]));
    return { playing: rotation.items.length > 0, billboardId, serverTime, rotation };
  },

  /** Admin preview of any schedule's ordered rotation (session-gated). */
  async getScheduleRotation(actor: User, scheduleId: string): Promise<RotationSummary> {
    authorizationPolicy.schedule.assertCanRead(actor);
    const scheduleDoc = await scheduleRepository.findById(scheduleId);
    if (!scheduleDoc) {
      throw new NotFoundError('Schedule not found.');
    }
    return buildSummaryForSchedule(toSchedule(scheduleDoc));
  },
};
