import { billboardRepository } from '@/server/modules/billboards/billboard.repository';
import { digitalSpecRepository } from '@/server/modules/billboards/digital-spec.repository';
import { toDigitalSpec, toPublicDigitalSpec } from '@/server/modules/billboards/digital-spec.utils';
import { authorizationPolicy } from '@/shared/policies';
import { BadRequestError, NotFoundError } from '@/shared/http/http-error';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import type { UpsertDigitalSpecSchemaOutput } from '@/shared/contracts/billboard/digital-spec.schema';
import type { DigitalSpec, PublicDigitalSpec } from '@/shared/types/billboard';
import type { User } from '@/shared/types/user';

export const digitalSpecService = {
  async getByBillboard(actor: User, billboardId: string): Promise<DigitalSpec | null> {
    authorizationPolicy.billboard.assertCanRead(actor);

    const billboard = await billboardRepository.findById(billboardId);
    if (!billboard) {
      throw new NotFoundError('Billboard not found.');
    }

    const spec = await digitalSpecRepository.findByBillboardId(billboardId);

    return spec ? toDigitalSpec(spec) : null;
  },

  /**
   * Public read of a billboard's digital spec. No actor/authorization
   * required; returns the public-safe projection or null when none exists.
   */
  async getPublicByBillboard(billboardId: string): Promise<PublicDigitalSpec | null> {
    const spec = await digitalSpecRepository.findByBillboardId(billboardId);

    return spec ? toPublicDigitalSpec(toDigitalSpec(spec)) : null;
  },

  async upsertForBillboard(
    actor: User,
    billboardId: string,
    input: UpsertDigitalSpecSchemaOutput,
  ): Promise<DigitalSpec> {
    authorizationPolicy.billboard.assertCanUpdate(actor);

    const billboard = await billboardRepository.findById(billboardId);
    if (!billboard) {
      throw new NotFoundError('Billboard not found.');
    }

    if (billboard.type !== BILLBOARD_TYPES.DIGITAL) {
      throw new BadRequestError('Only digital billboards can have specifications.');
    }

    const spec = await digitalSpecRepository.upsertByBillboardId(billboardId, input);

    return toDigitalSpec(spec);
  },
};
