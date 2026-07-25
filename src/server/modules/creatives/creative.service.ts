import { creativeRepository } from '@/server/modules/creatives/creative.repository';
import { toCreative } from '@/server/modules/creatives/creative.utils';
import type { CreativeDocument } from '@/server/modules/creatives/creative.model';
import { authorizationPolicy } from '@/shared/policies';
import { ForbiddenError, NotFoundError } from '@/shared/http/http-error';
import { CREATIVE_STATUSES } from '@/shared/constants/creative';
import type {
  CreateCreativeSchemaOutput,
  UpdateCreativeSchemaOutput,
} from '@/shared/contracts/creative/creative.schema';
import type { Creative, CreativeStatus } from '@/shared/types/creative';
import type { User } from '@/shared/types/user';

/** Loads a creative and enforces that the actor owns it (or can moderate). */
async function loadAccessible(actor: User, creativeId: string): Promise<CreativeDocument> {
  const creative = await creativeRepository.findById(creativeId);
  if (!creative) {
    throw new NotFoundError('Creative not found.');
  }

  const isOwner = creative.advertiserId === actor.id;
  if (!isOwner && !authorizationPolicy.creative.canModerate(actor.role)) {
    throw new ForbiddenError('You cannot access this creative.');
  }

  return creative;
}

export const creativeService = {
  async create(input: CreateCreativeSchemaOutput, actor: User): Promise<Creative> {
    authorizationPolicy.creative.assertCanCreate(actor);

    const created = await creativeRepository.create({
      ...input,
      advertiserId: actor.id,
      status: CREATIVE_STATUSES.PENDING,
    });

    return toCreative(created);
  },

  /** Advertisers see their own creatives; moderators (admins) see all. */
  async list(actor: User): Promise<Creative[]> {
    authorizationPolicy.creative.assertCanRead(actor);

    const creatives = authorizationPolicy.creative.canModerate(actor.role)
      ? await creativeRepository.findMany()
      : await creativeRepository.findByAdvertiser(actor.id);

    return creatives.map(toCreative);
  },

  async getById(actor: User, creativeId: string): Promise<Creative> {
    authorizationPolicy.creative.assertCanRead(actor);
    return toCreative(await loadAccessible(actor, creativeId));
  },

  async update(
    actor: User,
    creativeId: string,
    input: UpdateCreativeSchemaOutput,
  ): Promise<Creative> {
    authorizationPolicy.creative.assertCanUpdate(actor);
    await loadAccessible(actor, creativeId);

    const updated = await creativeRepository.updateById(creativeId, input);
    if (!updated) {
      throw new NotFoundError('Creative not found.');
    }

    return toCreative(updated);
  },

  async updateStatus(actor: User, creativeId: string, status: CreativeStatus): Promise<Creative> {
    authorizationPolicy.creative.assertCanModerate(actor);

    const updated = await creativeRepository.updateStatus(creativeId, status);
    if (!updated) {
      throw new NotFoundError('Creative not found.');
    }

    return toCreative(updated);
  },

  async delete(actor: User, creativeId: string): Promise<void> {
    authorizationPolicy.creative.assertCanDelete(actor);
    await loadAccessible(actor, creativeId);

    const deleted = await creativeRepository.deleteById(creativeId);
    if (!deleted) {
      throw new NotFoundError('Creative not found.');
    }
  },
};
