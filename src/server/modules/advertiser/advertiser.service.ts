import { advertiserRepository } from '@/server/modules/advertiser/advertiser.repository';
import { toAdvertiser } from '@/server/modules/advertiser/advertiser.utils';
import { createAdvertiserSchema } from '@/shared/contracts/advertiser/advertiser.schema';
import type {
  CreateAdvertiserSchemaInput,
  UpdateAdvertiserSchemaInput,
} from '@/shared/contracts/advertiser/advertiser.schema';
import { authorizationPolicy } from '@/shared/policies';
import { ConflictError, NotFoundError } from '@/shared/http/http-error';
import type { Advertiser } from '@/shared/types/advertiser';
import type { User } from '@/shared/types/user';

export const advertiserService = {
  /**
   * Creates the company profile for the actor's own account.
   *
   * The input is re-parsed here rather than trusted: registration composes this
   * contract into its own payload, and a future caller may not validate at all.
   */
  async create(actor: User, input: CreateAdvertiserSchemaInput): Promise<Advertiser> {
    authorizationPolicy.advertiser.assertCanCreateProfile(actor);

    const data = createAdvertiserSchema.parse(input);
    const existing = await advertiserRepository.findByUserId(actor.id);

    if (existing) {
      throw new ConflictError('This account already has an advertiser profile.');
    }

    const created = await advertiserRepository.create({ ...data, userId: actor.id });

    return toAdvertiser(created);
  },

  async getByUserId(userId: string, actor: User): Promise<Advertiser | null> {
    authorizationPolicy.advertiser.assertCanReadProfile(actor, userId);

    const advertiser = await advertiserRepository.findByUserId(userId);

    return advertiser ? toAdvertiser(advertiser) : null;
  },

  /**
   * Profiles for the given accounts, keyed by account id. Admin-only, and used
   * by cross-account views such as the advertiser directory.
   */
  async mapByUserIds(userIds: string[], actor: User): Promise<Map<string, Advertiser>> {
    authorizationPolicy.advertiser.assertCanListProfiles(actor);

    if (userIds.length === 0) {
      return new Map();
    }

    const advertisers = await advertiserRepository.findManyByUserIds(userIds);

    return new Map(advertisers.map((advertiser) => [advertiser.userId, toAdvertiser(advertiser)]));
  },

  async updateByUserId(
    userId: string,
    input: UpdateAdvertiserSchemaInput,
    actor: User,
  ): Promise<Advertiser> {
    authorizationPolicy.advertiser.assertCanUpdateProfile(actor, userId);

    const updated = await advertiserRepository.updateByUserId(userId, input);

    if (!updated) {
      throw new NotFoundError('We could not find an advertiser profile for this account.');
    }

    return toAdvertiser(updated);
  },
};
