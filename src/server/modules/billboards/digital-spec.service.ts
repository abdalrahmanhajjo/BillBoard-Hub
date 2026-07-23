import { billboardRepository } from '@/server/modules/billboards/billboard.repository';
import { digitalSpecRepository } from '@/server/modules/billboards/digital-spec.repository';
import { toDigitalSpec } from '@/server/modules/billboards/digital-spec.utils';
import { authorizationPolicy } from '@/shared/policies';
import { BadRequestError, NotFoundError } from '@/shared/http/http-error';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import type { UpsertDigitalSpecSchemaOutput } from '@/shared/contracts/billboard/digital-spec.schema';
import type { DigitalSpec } from '@/shared/types/billboard';
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
