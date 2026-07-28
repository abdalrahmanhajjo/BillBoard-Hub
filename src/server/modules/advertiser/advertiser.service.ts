import { advertiserRepository } from '@/server/modules/advertiser/advertiser.repository';
import { toAdvertiser } from '@/server/modules/advertiser/advertiser.utils';
import { authorizationPolicy } from '@/shared/policies';
import { NotFoundError } from '@/shared/http/http-error';
import type {
  CreateAdvertiserSchemaInput,
  UpdateAdvertiserSchemaInput,
} from '@/shared/contracts/advertiser/advertiser.schema';
import type { Advertiser } from '@/shared/types/advertiser';
import type { User } from '@/shared/types/user';

export const advertiserService = {
  async create(actor: User, input: CreateAdvertiserSchemaInput): Promise<Advertiser> {
    authorizationPolicy.advertiserProfile.assertCanCreate(actor);
    const existing = await advertiserRepository.findById(actor.id);
    if (existing) {
      throw new Error('Advertiser profile already exists for this user.');
    }
    const created = await advertiserRepository.create({
      ...input,
      userId: actor.id,
    });
    return toAdvertiser(created);
  },

  async delete(actor: User, advertiserId: string): Promise<Advertiser> {
    const advertiser = await advertiserRepository.findById(advertiserId);
    if (!advertiser) {
      throw new NotFoundError('Advertiser not found.');
    }
    authorizationPolicy.advertiserProfile.assertCanDelete(actor, advertiser.userId.toString());
    const deleted = await advertiserRepository.deleteById(advertiserId);
    if (!deleted) {
      throw new NotFoundError('Advertiser not found.');
    }
    return toAdvertiser(deleted);
  },

  async getById(actor: User, advertiserId: string): Promise<Advertiser> {
    const advertiser = await advertiserRepository.findById(advertiserId);
    if (!advertiser) {
      throw new NotFoundError('Advertiser not found.');
    }
    authorizationPolicy.advertiserProfile.assertCanRead(actor, advertiser.userId.toString());
    return toAdvertiser(advertiser);
  },

  async getAdvertiserByUser(actor: User): Promise<Advertiser> {
    const advertiser = await advertiserRepository.findByUserId(actor.id);
    if (!advertiser) {
      throw new NotFoundError('Advertiser not found.');
    }
    authorizationPolicy.advertiserProfile.assertCanRead(actor, advertiser.userId.toString());
    return toAdvertiser(advertiser);
  },

  async list(actor: User): Promise<Advertiser[]> {
    authorizationPolicy.advertiserProfile.assertCanRead(actor);
    const advertisers = await advertiserRepository.findMany();
    return advertisers.map(toAdvertiser);
  },

  async update(
    actor: User,
    advertiserId: string,
    input: UpdateAdvertiserSchemaInput,
  ): Promise<Advertiser> {
    const existing = await advertiserRepository.findById(advertiserId);
    if (!existing) {
      throw new NotFoundError('Advertiser not found.');
    }
    authorizationPolicy.advertiserProfile.assertCanUpdate(actor, existing.userId.toString());

    const updated = await advertiserRepository.updateById(advertiserId, input);
    if (!updated) {
      throw new NotFoundError('Advertiser not found.');
    }
    return toAdvertiser(updated);
  },
};
