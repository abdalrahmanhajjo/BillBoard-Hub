import { connectToDatabase } from '@/server/db/mongoose';
import { ExpenseModel, type ExpenseDocument } from '@/server/modules/finance/expense.model';
import {
  OwnerModel,
  OwnerPaymentModel,
  type OwnerDocument,
  type OwnerPaymentDocument,
} from '@/server/modules/finance/owner.model';
import {
  FinanceAuditModel,
  type FinanceAuditDocument,
} from '@/server/modules/finance/finance-audit.model';
import type {
  ExpenseFilter,
  ExpenseRecord,
  FinanceAuditRecord,
  MonthlyAmountRow,
  OwnerPaymentRecord,
  OwnerRecord,
} from '@/server/modules/finance/finance.types';
import { EXPENSE_STATUSES, OWNER_PAYMENT_STATUSES } from '@/shared/constants/finance';
import type { CategoryTotal } from '@/shared/types/finance';

function toDateFilter(filter: ExpenseFilter): Record<string, unknown> {
  const query: Record<string, unknown> = {};

  if (filter.billboardId) query.billboardId = filter.billboardId;
  if (filter.ownerId) query.ownerId = filter.ownerId;
  if (filter.category) query.category = filter.category;
  if (filter.status) query.status = filter.status;

  if (filter.from || filter.to) {
    query.date = {
      ...(filter.from ? { $gte: filter.from } : {}),
      ...(filter.to ? { $lte: filter.to } : {}),
    };
  }

  return query;
}

export const expenseRepository = {
  async create(data: ExpenseRecord): Promise<ExpenseDocument> {
    await connectToDatabase();
    const created = await ExpenseModel.create(data);
    return created.toObject() as ExpenseDocument;
  },

  async findById(expenseId: string): Promise<ExpenseDocument | null> {
    await connectToDatabase();
    return ExpenseModel.findById(expenseId).lean<ExpenseDocument>().exec();
  },

  async findMany(filter: ExpenseFilter = {}): Promise<ExpenseDocument[]> {
    await connectToDatabase();
    return ExpenseModel.find(toDateFilter(filter))
      .sort({ date: -1, createdAt: -1 })
      .lean<ExpenseDocument[]>()
      .exec();
  },

  async updateById(
    expenseId: string,
    data: Partial<ExpenseRecord>,
  ): Promise<ExpenseDocument | null> {
    await connectToDatabase();
    return ExpenseModel.findByIdAndUpdate(expenseId, data, { new: true })
      .lean<ExpenseDocument>()
      .exec();
  },

  async deleteById(expenseId: string): Promise<boolean> {
    await connectToDatabase();
    const result = await ExpenseModel.findByIdAndDelete(expenseId).lean().exec();
    return Boolean(result);
  },

  /**
   * Cancelled expenses are excluded from every aggregate here: they exist for
   * the audit trail, not as money the company actually owes or spent.
   */
  async sumByCategory(from: Date, to: Date): Promise<CategoryTotal[]> {
    await connectToDatabase();

    const rows = await ExpenseModel.aggregate<{
      _id: { category: string; group: string };
      baseAmount: number;
      count: number;
    }>([
      { $match: { date: { $gte: from, $lte: to }, status: { $ne: EXPENSE_STATUSES.CANCELLED } } },
      {
        $group: {
          _id: { category: '$category', group: '$categoryGroup' },
          baseAmount: { $sum: '$baseAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { baseAmount: -1 } },
    ]);

    return rows.map((row) => ({
      category: row._id.category,
      label: row._id.category,
      group: row._id.group as CategoryTotal['group'],
      baseAmount: row.baseAmount,
      count: row.count,
    }));
  },

  async sumByMonth(from: Date, to: Date): Promise<MonthlyAmountRow[]> {
    await connectToDatabase();

    const rows = await ExpenseModel.aggregate<{ _id: string; amount: number }>([
      { $match: { date: { $gte: from, $lte: to }, status: { $ne: EXPENSE_STATUSES.CANCELLED } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          amount: { $sum: '$baseAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return rows.map((row) => ({ month: row._id, amount: row.amount }));
  },

  async sumByBillboard(
    from: Date,
    to: Date,
  ): Promise<Array<{ billboardId: string; amount: number }>> {
    await connectToDatabase();

    const rows = await ExpenseModel.aggregate<{ _id: string; amount: number }>([
      {
        $match: {
          date: { $gte: from, $lte: to },
          status: { $ne: EXPENSE_STATUSES.CANCELLED },
          billboardId: { $type: 'string', $ne: '' },
        },
      },
      { $group: { _id: '$billboardId', amount: { $sum: '$baseAmount' } } },
    ]);

    return rows.map((row) => ({ billboardId: row._id, amount: row.amount }));
  },

  async sumByStatus(from: Date, to: Date): Promise<Record<string, number>> {
    await connectToDatabase();

    const rows = await ExpenseModel.aggregate<{ _id: string; amount: number }>([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: '$status', amount: { $sum: '$baseAmount' } } },
    ]);

    return Object.fromEntries(rows.map((row) => [row._id, row.amount]));
  },
};

export const ownerRepository = {
  async create(data: OwnerRecord): Promise<OwnerDocument> {
    await connectToDatabase();
    const created = await OwnerModel.create(data);
    return created.toObject() as OwnerDocument;
  },

  async findById(ownerId: string): Promise<OwnerDocument | null> {
    await connectToDatabase();
    return OwnerModel.findById(ownerId).lean<OwnerDocument>().exec();
  },

  async findMany(filter: { isActive?: boolean } = {}): Promise<OwnerDocument[]> {
    await connectToDatabase();
    return OwnerModel.find(filter).sort({ name: 1 }).lean<OwnerDocument[]>().exec();
  },

  async updateById(ownerId: string, data: Partial<OwnerRecord>): Promise<OwnerDocument | null> {
    await connectToDatabase();
    return OwnerModel.findByIdAndUpdate(ownerId, data, { new: true }).lean<OwnerDocument>().exec();
  },

  async deleteById(ownerId: string): Promise<boolean> {
    await connectToDatabase();
    const result = await OwnerModel.findByIdAndDelete(ownerId).lean().exec();
    return Boolean(result);
  },
};

export const ownerPaymentRepository = {
  async create(data: OwnerPaymentRecord): Promise<OwnerPaymentDocument> {
    await connectToDatabase();
    const created = await OwnerPaymentModel.create(data);
    return created.toObject() as OwnerPaymentDocument;
  },

  async findById(paymentId: string): Promise<OwnerPaymentDocument | null> {
    await connectToDatabase();
    return OwnerPaymentModel.findById(paymentId).lean<OwnerPaymentDocument>().exec();
  },

  async findMany(
    filter: { ownerId?: string; status?: string } = {},
  ): Promise<OwnerPaymentDocument[]> {
    await connectToDatabase();
    return OwnerPaymentModel.find(filter)
      .sort({ dueDate: -1 })
      .lean<OwnerPaymentDocument[]>()
      .exec();
  },

  async updateById(
    paymentId: string,
    data: Partial<OwnerPaymentRecord>,
  ): Promise<OwnerPaymentDocument | null> {
    await connectToDatabase();
    return OwnerPaymentModel.findByIdAndUpdate(paymentId, data, { new: true })
      .lean<OwnerPaymentDocument>()
      .exec();
  },

  async deleteById(paymentId: string): Promise<boolean> {
    await connectToDatabase();
    const result = await OwnerPaymentModel.findByIdAndDelete(paymentId).lean().exec();
    return Boolean(result);
  },

  /** Outstanding obligations, split into what is merely due and what is late. */
  async outstanding(now: Date, monthEnd: Date) {
    await connectToDatabase();

    const rows = await OwnerPaymentModel.aggregate<{ _id: string; amount: number; count: number }>([
      { $match: { status: OWNER_PAYMENT_STATUSES.PENDING } },
      {
        $group: {
          _id: {
            $cond: [
              { $lt: ['$dueDate', now] },
              'overdue',
              { $cond: [{ $lte: ['$dueDate', monthEnd] }, 'due_this_month', 'later'] },
            ],
          },
          amount: { $sum: '$baseAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const byBucket = Object.fromEntries(rows.map((row) => [row._id, row]));

    return {
      overdue: byBucket.overdue?.amount ?? 0,
      dueThisMonth: byBucket.due_this_month?.amount ?? 0,
      pendingCount: rows.reduce((total, row) => total + row.count, 0),
    };
  },
};

export const financeAuditRepository = {
  async record(entry: FinanceAuditRecord): Promise<void> {
    await connectToDatabase();
    await FinanceAuditModel.create(entry);
  },

  async findForEntity(entityId: string, limit = 50): Promise<FinanceAuditDocument[]> {
    await connectToDatabase();
    return FinanceAuditModel.find({ entityId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<FinanceAuditDocument[]>()
      .exec();
  },

  async findRecent(limit = 50): Promise<FinanceAuditDocument[]> {
    await connectToDatabase();
    return FinanceAuditModel.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<FinanceAuditDocument[]>()
      .exec();
  },
};
