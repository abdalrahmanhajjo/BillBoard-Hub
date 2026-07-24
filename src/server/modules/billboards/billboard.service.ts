import { billboardRepository } from '@/server/modules/billboards/billboard.repository';
import { toBillboard } from '@/server/modules/billboards/billboard.utils';
import { authorizationPolicy } from '@/shared/policies';
import { ConflictError, NotFoundError } from '@/shared/http/http-error';
import { isBillboardBookable } from '@/shared/utils/billboard-availability';
import type {
  CreateBillboardSchemaOutput,
  UpdateBillboardSchemaOutput,
} from '@/shared/contracts/billboard/billboard.schema';
import type { BillboardQuerySchemaOutput } from '@/shared/contracts/billboard/billboard-query.schema';
import type { Billboard, BillboardStatus } from '@/shared/types/billboard';
import type { User } from '@/shared/types/user';

export const billboardService = {
  async create(input: CreateBillboardSchemaOutput, actor: User): Promise<Billboard> {
    authorizationPolicy.billboard.assertCanCreate(actor);
    const existing = await billboardRepository.findByCode(input.code);
    if (existing) {
      throw new ConflictError('Billboard code is already in use.');
    }
    const created = await billboardRepository.create({ ...input, createdBy: actor.id });
    return toBillboard(created);
  },
  async list(actor: User, filters: BillboardQuerySchemaOutput = {}): Promise<Billboard[]> {
    authorizationPolicy.billboard.assertCanRead(actor);
    const billboards = await billboardRepository.findMany(filters);
    return billboards.map(toBillboard);
  },
  async getById(actor: User, billboardId: string): Promise<Billboard> {
    authorizationPolicy.billboard.assertCanRead(actor);
    const billboard = await billboardRepository.findById(billboardId);
    if (!billboard) {
      throw new NotFoundError('Billboard not found.');
    }
    return toBillboard(billboard);
  },
  async update(
    actor: User,
    billboardId: string,
    input: UpdateBillboardSchemaOutput,
  ): Promise<Billboard> {
    authorizationPolicy.billboard.assertCanUpdate(actor);
    const updated = await billboardRepository.updateById(billboardId, input);
    if (!updated) {
      throw new NotFoundError('Billboard not found.');
    }
    return toBillboard(updated);
  },
  async updateAvailability(
    actor: User,
    billboardId: string,
    status: BillboardStatus,
  ): Promise<Billboard> {
    authorizationPolicy.billboard.assertCanUpdate(actor);
    const updated = await billboardRepository.updateStatus(billboardId, status);
    if (!updated) {
      throw new NotFoundError('Billboard not found.');
    }
    return toBillboard(updated);
  },
  assertBookable(billboard: Billboard): void {
    if (!isBillboardBookable(billboard.status)) {
      throw new ConflictError('Billboard is not available for booking.');
    }
  },
};
