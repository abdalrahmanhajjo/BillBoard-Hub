import {
  impressionRepository,
  type ImpressionFilter,
} from '@/server/modules/impressions/impression.repository';
import { toImpression } from '@/server/modules/impressions/impression.utils';
import { billboardRepository } from '@/server/modules/billboards/billboard.repository';
import { playlistRepository } from '@/server/modules/playlists/playlist.repository';
import { creativeRepository } from '@/server/modules/creatives/creative.repository';
import { authorizationPolicy } from '@/shared/policies';
import { BadRequestError, NotFoundError } from '@/shared/http/http-error';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import type { RecordImpressionSchemaOutput } from '@/shared/contracts/impression/impression.schema';
import type { Impression, ImpressionAnalytics } from '@/shared/types/impression';
import type { User } from '@/shared/types/user';

export const impressionService = {
  /**
   * Records a play event from a screen. Validates the full reference chain
   * (screen → playlist → creative) so a device cannot inflate arbitrary
   * counts. Production would additionally gate this with per-device API keys
   * and rate limiting.
   */
  async record(billboardId: string, input: RecordImpressionSchemaOutput): Promise<Impression> {
    const billboard = await billboardRepository.findById(billboardId);
    if (!billboard) {
      throw new NotFoundError('We could not find this billboard. It may have been removed.');
    }
    if (billboard.type !== BILLBOARD_TYPES.DIGITAL) {
      throw new BadRequestError('Impressions can only be recorded for digital billboards.');
    }

    const playlist = await playlistRepository.findById(input.playlistId);
    if (!playlist) {
      throw new NotFoundError('We could not find this playlist. It may have been removed.');
    }
    if (playlist.billboardId !== billboardId) {
      throw new BadRequestError('The playlist does not belong to this screen.');
    }
    if (!playlist.creativeIds.map(String).includes(input.creativeId)) {
      throw new BadRequestError('The creative is not part of this playlist.');
    }

    const creative = await creativeRepository.findById(input.creativeId);
    if (!creative) {
      throw new NotFoundError('We could not find this creative. It may have been removed.');
    }

    const occurredAt = input.occurredAt ? new Date(input.occurredAt) : new Date();
    const created = await impressionRepository.create({
      billboardId,
      playlistId: input.playlistId,
      creativeId: input.creativeId,
      scheduleId: input.scheduleId,
      occurredAt,
    });
    return toImpression(created);
  },

  async getAnalytics(actor: User, filter: ImpressionFilter = {}): Promise<ImpressionAnalytics> {
    authorizationPolicy.impression.assertCanRead(actor);

    const [total, byCreativeRaw, recentDocs] = await Promise.all([
      impressionRepository.countTotal(filter),
      impressionRepository.aggregateByCreative(filter),
      impressionRepository.findRecent(filter, 20),
    ]);

    const creativeIds = byCreativeRaw.map((row) => row.creativeId);
    const creatives = creativeIds.length ? await creativeRepository.findByIds(creativeIds) : [];
    const nameById = new Map(creatives.map((creative) => [String(creative._id), creative.name]));

    const byCreative = byCreativeRaw.map((row) => ({
      creativeId: row.creativeId,
      name: nameById.get(row.creativeId) ?? 'Unknown creative',
      count: row.count,
    }));

    return {
      total,
      byCreative,
      recent: recentDocs.map(toImpression),
    };
  },
};
