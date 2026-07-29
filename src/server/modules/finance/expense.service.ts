import { billboardRepository } from '@/server/modules/billboards/billboard.repository';
import {
  expenseRepository,
  financeAuditRepository,
  ownerRepository,
} from '@/server/modules/finance/finance.repository';
import type { ExpenseDocument } from '@/server/modules/finance/expense.model';
import type { ExpenseFilter, ExpenseRecord } from '@/server/modules/finance/finance.types';
import { toExpense } from '@/server/modules/finance/finance.utils';
import { FINANCE_AUDIT_ACTIONS, FINANCE_AUDIT_ENTITIES } from '@/shared/constants/finance';
import { categoryGroupOf, toBaseAmount } from '@/shared/finance/finance-math';
import { BadRequestError, NotFoundError } from '@/shared/http/http-error';
import { authorizationPolicy } from '@/shared/policies';
import type {
  CreateExpenseSchemaOutput,
  ListExpensesSchemaOutput,
  UpdateExpenseSchemaOutput,
} from '@/shared/contracts/finance/expense.schema';
import type { Expense } from '@/shared/types/finance';
import type { User } from '@/shared/types/user';

/**
 * A referenced billboard or owner must exist before the expense is written.
 * Reports join on these ids, so a dangling reference would quietly drop the
 * cost out of per-billboard profitability without any error surfacing.
 */
async function assertRelationsExist(input: {
  billboardId?: string;
  ownerId?: string;
}): Promise<void> {
  if (input.billboardId) {
    const billboard = await billboardRepository.findById(input.billboardId);
    if (!billboard) {
      throw new BadRequestError('That billboard does not exist. Pick one from the list.');
    }
  }

  if (input.ownerId) {
    const owner = await ownerRepository.findById(input.ownerId);
    if (!owner) {
      throw new BadRequestError('That billboard owner does not exist. Pick one from the list.');
    }
  }
}

function diffOf(
  before: ExpenseDocument,
  after: ExpenseDocument,
): Record<string, { from: unknown; to: unknown }> {
  const tracked = ['title', 'category', 'amount', 'currency', 'status', 'date', 'billboardId'];
  const changes: Record<string, { from: unknown; to: unknown }> = {};

  for (const key of tracked) {
    const from = before[key as keyof ExpenseDocument];
    const to = after[key as keyof ExpenseDocument];
    if (String(from) !== String(to)) {
      changes[key] = { from, to };
    }
  }

  return changes;
}

export const expenseService = {
  async create(input: CreateExpenseSchemaOutput, actor: User): Promise<Expense> {
    authorizationPolicy.finance.assertCanCreate(actor);
    await assertRelationsExist(input);

    const { baseAmount, exchangeRate } = toBaseAmount(
      input.amount,
      input.currency,
      input.exchangeRate,
    );

    const record: ExpenseRecord = {
      title: input.title,
      category: input.category,
      categoryGroup: categoryGroupOf(input.category),
      amount: input.amount,
      currency: input.currency,
      exchangeRate,
      baseAmount,
      recurrence: input.recurrence,
      status: input.status,
      paymentMethod: input.paymentMethod,
      date: new Date(input.date),
      billboardId: input.billboardId,
      ownerId: input.ownerId,
      vendorName: input.vendorName,
      referenceNumber: input.referenceNumber,
      notes: input.notes,
      attachments: input.attachments,
      createdBy: actor.id,
    };

    const created = await expenseRepository.create(record);

    await financeAuditRepository.record({
      entity: FINANCE_AUDIT_ENTITIES.EXPENSE,
      entityId: String(created._id),
      action: FINANCE_AUDIT_ACTIONS.CREATED,
      actorId: actor.id,
      actorEmail: actor.email,
      summary: `Recorded ${input.title} for ${input.currency} ${input.amount}`,
    });

    return toExpense(created);
  },

  async list(filter: ListExpensesSchemaOutput, actor: User): Promise<Expense[]> {
    authorizationPolicy.finance.assertCanView(actor);

    const query: ExpenseFilter = {
      billboardId: filter.billboardId,
      ownerId: filter.ownerId,
      category: filter.category,
      status: filter.status,
      from: filter.from ? new Date(filter.from) : undefined,
      to: filter.to ? new Date(filter.to) : undefined,
    };

    const documents = await expenseRepository.findMany(query);
    return documents.map(toExpense);
  },

  async getById(expenseId: string, actor: User): Promise<Expense> {
    authorizationPolicy.finance.assertCanView(actor);

    const expense = await expenseRepository.findById(expenseId);
    if (!expense) {
      throw new NotFoundError('We could not find this expense. It may have been removed.');
    }

    return toExpense(expense);
  },

  async update(expenseId: string, input: UpdateExpenseSchemaOutput, actor: User): Promise<Expense> {
    authorizationPolicy.finance.assertCanUpdate(actor);

    const existing = await expenseRepository.findById(expenseId);
    if (!existing) {
      throw new NotFoundError('We could not find this expense. It may have been removed.');
    }
    await assertRelationsExist(input);

    const patch: Partial<ExpenseRecord> = {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.category !== undefined
        ? { category: input.category, categoryGroup: categoryGroupOf(input.category) }
        : {}),
      ...(input.recurrence !== undefined ? { recurrence: input.recurrence } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.paymentMethod !== undefined ? { paymentMethod: input.paymentMethod } : {}),
      ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
      ...(input.billboardId !== undefined ? { billboardId: input.billboardId } : {}),
      ...(input.ownerId !== undefined ? { ownerId: input.ownerId } : {}),
      ...(input.vendorName !== undefined ? { vendorName: input.vendorName } : {}),
      ...(input.referenceNumber !== undefined ? { referenceNumber: input.referenceNumber } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.attachments !== undefined ? { attachments: input.attachments } : {}),
    };

    // Amount, currency, and rate move together: changing one without
    // recomputing `baseAmount` would leave the stored total disagreeing with
    // the amount on screen.
    if (input.amount !== undefined || input.currency !== undefined) {
      const amount = input.amount ?? existing.amount;
      const currency = input.currency ?? existing.currency;
      const rate =
        input.exchangeRate ?? (currency === existing.currency ? existing.exchangeRate : undefined);
      const converted = toBaseAmount(amount, currency, rate);

      patch.amount = amount;
      patch.currency = currency;
      patch.exchangeRate = converted.exchangeRate;
      patch.baseAmount = converted.baseAmount;
    }

    const updated = await expenseRepository.updateById(expenseId, patch);
    if (!updated) {
      throw new NotFoundError('We could not find this expense. It may have been removed.');
    }

    await financeAuditRepository.record({
      entity: FINANCE_AUDIT_ENTITIES.EXPENSE,
      entityId: expenseId,
      action:
        input.status !== undefined && Object.keys(patch).length === 1
          ? FINANCE_AUDIT_ACTIONS.STATUS_CHANGED
          : FINANCE_AUDIT_ACTIONS.UPDATED,
      actorId: actor.id,
      actorEmail: actor.email,
      summary: `Updated ${updated.title}`,
      changes: diffOf(existing, updated),
    });

    return toExpense(updated);
  },

  async remove(expenseId: string, actor: User): Promise<void> {
    authorizationPolicy.finance.assertCanDelete(actor);

    const existing = await expenseRepository.findById(expenseId);
    if (!existing) {
      throw new NotFoundError('We could not find this expense. It may have been removed.');
    }

    await expenseRepository.deleteById(expenseId);

    await financeAuditRepository.record({
      entity: FINANCE_AUDIT_ENTITIES.EXPENSE,
      entityId: expenseId,
      action: FINANCE_AUDIT_ACTIONS.DELETED,
      actorId: actor.id,
      actorEmail: actor.email,
      summary: `Deleted ${existing.title} (${existing.currency} ${existing.amount})`,
    });
  },
};
