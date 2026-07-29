import {
  expenseRepository,
  financeAuditRepository,
  ownerPaymentRepository,
  ownerRepository,
} from '@/server/modules/finance/finance.repository';
import { billboardRepository } from '@/server/modules/billboards/billboard.repository';
import type { OwnerPaymentRecord, OwnerRecord } from '@/server/modules/finance/finance.types';
import { toOwner, toOwnerPayment } from '@/server/modules/finance/finance.utils';
import {
  FINANCE_AUDIT_ACTIONS,
  FINANCE_AUDIT_ENTITIES,
  OWNER_PAYMENT_STATUSES,
} from '@/shared/constants/finance';
import { round2, toBaseAmount } from '@/shared/finance/finance-math';
import { BadRequestError, ConflictError, NotFoundError } from '@/shared/http/http-error';
import { authorizationPolicy } from '@/shared/policies';
import type {
  CreateOwnerPaymentSchemaOutput,
  CreateOwnerSchemaOutput,
  SettleOwnerPaymentSchemaOutput,
  UpdateOwnerSchemaOutput,
} from '@/shared/contracts/finance/owner.schema';
import type { BillboardOwner, OwnerPayment } from '@/shared/types/finance';
import type { User } from '@/shared/types/user';

export type OwnerWithBalance = BillboardOwner & {
  totalPaid: number;
  totalPending: number;
  overdue: number;
  paymentCount: number;
};

export const ownerService = {
  async create(input: CreateOwnerSchemaOutput, actor: User): Promise<BillboardOwner> {
    authorizationPolicy.finance.assertCanCreate(actor);

    const record: OwnerRecord = {
      name: input.name,
      companyName: input.companyName,
      email: input.email,
      phone: input.phone,
      address: input.address,
      contractReference: input.contractReference,
      contractStartDate: input.contractStartDate ? new Date(input.contractStartDate) : undefined,
      contractEndDate: input.contractEndDate ? new Date(input.contractEndDate) : undefined,
      monthlyPayment: input.monthlyPayment,
      currency: input.currency,
      notes: input.notes,
      isActive: input.isActive,
      createdBy: actor.id,
    };

    const created = await ownerRepository.create(record);

    await financeAuditRepository.record({
      entity: FINANCE_AUDIT_ENTITIES.OWNER,
      entityId: String(created._id),
      action: FINANCE_AUDIT_ACTIONS.CREATED,
      actorId: actor.id,
      actorEmail: actor.email,
      summary: `Added billboard owner ${input.name}`,
    });

    return toOwner(created);
  },

  /** Owners with their settled/outstanding balances, for the directory screen. */
  async list(actor: User): Promise<OwnerWithBalance[]> {
    authorizationPolicy.finance.assertCanView(actor);

    const [owners, payments] = await Promise.all([
      ownerRepository.findMany(),
      ownerPaymentRepository.findMany(),
    ]);

    const now = Date.now();

    return owners.map((owner) => {
      const ownerId = String(owner._id);
      const mine = payments.filter((payment) => payment.ownerId === ownerId);

      const totalPaid = mine
        .filter((payment) => payment.status === OWNER_PAYMENT_STATUSES.PAID)
        .reduce((total, payment) => total + payment.baseAmount, 0);

      const pending = mine.filter((payment) => payment.status === OWNER_PAYMENT_STATUSES.PENDING);

      return {
        ...toOwner(owner),
        totalPaid: round2(totalPaid),
        totalPending: round2(pending.reduce((total, payment) => total + payment.baseAmount, 0)),
        overdue: round2(
          pending
            .filter((payment) => new Date(payment.dueDate).getTime() < now)
            .reduce((total, payment) => total + payment.baseAmount, 0),
        ),
        paymentCount: mine.length,
      };
    });
  },

  async getById(ownerId: string, actor: User): Promise<BillboardOwner> {
    authorizationPolicy.finance.assertCanView(actor);

    const owner = await ownerRepository.findById(ownerId);
    if (!owner) {
      throw new NotFoundError('We could not find this owner. They may have been removed.');
    }

    return toOwner(owner);
  },

  async update(
    ownerId: string,
    input: UpdateOwnerSchemaOutput,
    actor: User,
  ): Promise<BillboardOwner> {
    authorizationPolicy.finance.assertCanUpdate(actor);

    const existing = await ownerRepository.findById(ownerId);
    if (!existing) {
      throw new NotFoundError('We could not find this owner. They may have been removed.');
    }

    const patch: Partial<OwnerRecord> = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.companyName !== undefined ? { companyName: input.companyName } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
      ...(input.contractReference !== undefined
        ? { contractReference: input.contractReference }
        : {}),
      ...(input.contractStartDate !== undefined
        ? { contractStartDate: new Date(input.contractStartDate) }
        : {}),
      ...(input.contractEndDate !== undefined
        ? { contractEndDate: new Date(input.contractEndDate) }
        : {}),
      ...(input.monthlyPayment !== undefined ? { monthlyPayment: input.monthlyPayment } : {}),
      ...(input.currency !== undefined ? { currency: input.currency } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    };

    const updated = await ownerRepository.updateById(ownerId, patch);
    if (!updated) {
      throw new NotFoundError('We could not find this owner. They may have been removed.');
    }

    await financeAuditRepository.record({
      entity: FINANCE_AUDIT_ENTITIES.OWNER,
      entityId: ownerId,
      action: FINANCE_AUDIT_ACTIONS.UPDATED,
      actorId: actor.id,
      actorEmail: actor.email,
      summary: `Updated owner ${updated.name}`,
    });

    return toOwner(updated);
  },

  /**
   * Deletion is refused while financial history references the owner. Removing
   * them would orphan payments and silently change past profit figures; making
   * them inactive keeps the ledger intact.
   */
  async remove(ownerId: string, actor: User): Promise<void> {
    authorizationPolicy.finance.assertCanDelete(actor);

    const existing = await ownerRepository.findById(ownerId);
    if (!existing) {
      throw new NotFoundError('We could not find this owner. They may have been removed.');
    }

    const [payments, expenses] = await Promise.all([
      ownerPaymentRepository.findMany({ ownerId }),
      expenseRepository.findMany({ ownerId }),
    ]);

    if (payments.length > 0 || expenses.length > 0) {
      throw new ConflictError(
        'This owner has financial records. Mark them inactive instead of deleting.',
      );
    }

    await ownerRepository.deleteById(ownerId);

    await financeAuditRepository.record({
      entity: FINANCE_AUDIT_ENTITIES.OWNER,
      entityId: ownerId,
      action: FINANCE_AUDIT_ACTIONS.DELETED,
      actorId: actor.id,
      actorEmail: actor.email,
      summary: `Deleted owner ${existing.name}`,
    });
  },
};

export const ownerPaymentService = {
  async create(input: CreateOwnerPaymentSchemaOutput, actor: User): Promise<OwnerPayment> {
    authorizationPolicy.finance.assertCanCreate(actor);

    const owner = await ownerRepository.findById(input.ownerId);
    if (!owner) {
      throw new BadRequestError('That owner does not exist. Pick one from the list.');
    }

    if (input.billboardId) {
      const billboard = await billboardRepository.findById(input.billboardId);
      if (!billboard) {
        throw new BadRequestError('That billboard does not exist. Pick one from the list.');
      }
    }

    if (input.status === OWNER_PAYMENT_STATUSES.PAID && !input.paidDate) {
      throw new BadRequestError('Record the date the payment was made.');
    }

    const { baseAmount, exchangeRate } = toBaseAmount(
      input.amount,
      input.currency,
      input.exchangeRate,
    );

    const record: OwnerPaymentRecord = {
      ownerId: input.ownerId,
      billboardId: input.billboardId,
      amount: input.amount,
      currency: input.currency,
      exchangeRate,
      baseAmount,
      dueDate: new Date(input.dueDate),
      paidDate: input.paidDate ? new Date(input.paidDate) : undefined,
      status: input.status,
      paymentMethod: input.paymentMethod,
      referenceNumber: input.referenceNumber,
      notes: input.notes,
      createdBy: actor.id,
    };

    const created = await ownerPaymentRepository.create(record);

    await financeAuditRepository.record({
      entity: FINANCE_AUDIT_ENTITIES.OWNER_PAYMENT,
      entityId: String(created._id),
      action: FINANCE_AUDIT_ACTIONS.CREATED,
      actorId: actor.id,
      actorEmail: actor.email,
      summary: `Scheduled ${input.currency} ${input.amount} to ${owner.name}`,
    });

    return toOwnerPayment(created);
  },

  async list(actor: User, filter: { ownerId?: string } = {}): Promise<OwnerPayment[]> {
    authorizationPolicy.finance.assertCanView(actor);

    const documents = await ownerPaymentRepository.findMany(filter);
    return documents.map(toOwnerPayment);
  },

  async settle(
    paymentId: string,
    input: SettleOwnerPaymentSchemaOutput,
    actor: User,
  ): Promise<OwnerPayment> {
    authorizationPolicy.finance.assertCanUpdate(actor);

    const existing = await ownerPaymentRepository.findById(paymentId);
    if (!existing) {
      throw new NotFoundError('We could not find this payment. It may have been removed.');
    }

    const updated = await ownerPaymentRepository.updateById(paymentId, {
      status: input.status,
      paidDate:
        input.status === OWNER_PAYMENT_STATUSES.PAID && input.paidDate
          ? new Date(input.paidDate)
          : undefined,
      paymentMethod: input.paymentMethod ?? existing.paymentMethod,
      referenceNumber: input.referenceNumber ?? existing.referenceNumber,
    });

    if (!updated) {
      throw new NotFoundError('We could not find this payment. It may have been removed.');
    }

    await financeAuditRepository.record({
      entity: FINANCE_AUDIT_ENTITIES.OWNER_PAYMENT,
      entityId: paymentId,
      action: FINANCE_AUDIT_ACTIONS.STATUS_CHANGED,
      actorId: actor.id,
      actorEmail: actor.email,
      summary: `Payment marked ${input.status}`,
      changes: { status: { from: existing.status, to: input.status } },
    });

    return toOwnerPayment(updated);
  },

  async remove(paymentId: string, actor: User): Promise<void> {
    authorizationPolicy.finance.assertCanDelete(actor);

    const existing = await ownerPaymentRepository.findById(paymentId);
    if (!existing) {
      throw new NotFoundError('We could not find this payment. It may have been removed.');
    }

    await ownerPaymentRepository.deleteById(paymentId);

    await financeAuditRepository.record({
      entity: FINANCE_AUDIT_ENTITIES.OWNER_PAYMENT,
      entityId: paymentId,
      action: FINANCE_AUDIT_ACTIONS.DELETED,
      actorId: actor.id,
      actorEmail: actor.email,
      summary: `Deleted scheduled payment (${existing.currency} ${existing.amount})`,
    });
  },
};
