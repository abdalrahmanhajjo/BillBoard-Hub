import type { ExpenseDocument } from '@/server/modules/finance/expense.model';
import type { OwnerDocument, OwnerPaymentDocument } from '@/server/modules/finance/owner.model';
import type { FinanceAuditDocument } from '@/server/modules/finance/finance-audit.model';
import type {
  BillboardOwner,
  Expense,
  ExpenseCategoryGroup,
  FinanceAuditEntry,
  OwnerPayment,
} from '@/shared/types/finance';

function isoDate(value?: Date | string): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

function isoDateTime(value?: Date | string): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function toExpense(document: ExpenseDocument): Expense {
  return {
    id: String(document._id),
    title: document.title,
    category: document.category,
    categoryGroup: document.categoryGroup as ExpenseCategoryGroup,
    amount: document.amount,
    currency: document.currency,
    exchangeRate: document.exchangeRate,
    baseAmount: document.baseAmount,
    recurrence: document.recurrence,
    status: document.status,
    paymentMethod: document.paymentMethod,
    date: isoDate(document.date) ?? '',
    billboardId: document.billboardId ?? undefined,
    ownerId: document.ownerId ?? undefined,
    vendorName: document.vendorName ?? undefined,
    referenceNumber: document.referenceNumber ?? undefined,
    notes: document.notes ?? undefined,
    attachments: (document.attachments ?? []).map((attachment) => ({
      name: attachment.name,
      url: attachment.url,
    })),
    createdBy: document.createdBy,
    createdAt: isoDateTime(document.createdAt),
    updatedAt: isoDateTime(document.updatedAt),
  };
}

export function toOwner(document: OwnerDocument): BillboardOwner {
  return {
    id: String(document._id),
    name: document.name,
    companyName: document.companyName ?? undefined,
    email: document.email ?? undefined,
    phone: document.phone ?? undefined,
    address: document.address ?? undefined,
    contractReference: document.contractReference ?? undefined,
    contractStartDate: isoDate(document.contractStartDate),
    contractEndDate: isoDate(document.contractEndDate),
    monthlyPayment: document.monthlyPayment,
    currency: document.currency,
    notes: document.notes ?? undefined,
    isActive: document.isActive,
    createdBy: document.createdBy,
    createdAt: isoDateTime(document.createdAt),
    updatedAt: isoDateTime(document.updatedAt),
  };
}

export function toOwnerPayment(document: OwnerPaymentDocument): OwnerPayment {
  return {
    id: String(document._id),
    ownerId: document.ownerId,
    billboardId: document.billboardId ?? undefined,
    amount: document.amount,
    currency: document.currency,
    exchangeRate: document.exchangeRate,
    baseAmount: document.baseAmount,
    dueDate: isoDate(document.dueDate) ?? '',
    paidDate: isoDate(document.paidDate),
    status: document.status,
    paymentMethod: document.paymentMethod ?? undefined,
    referenceNumber: document.referenceNumber ?? undefined,
    notes: document.notes ?? undefined,
    createdBy: document.createdBy,
    createdAt: isoDateTime(document.createdAt),
    updatedAt: isoDateTime(document.updatedAt),
  };
}

export function toAuditEntry(document: FinanceAuditDocument): FinanceAuditEntry {
  return {
    id: String(document._id),
    entity: document.entity,
    entityId: document.entityId,
    action: document.action,
    actorId: document.actorId,
    actorEmail: document.actorEmail ?? undefined,
    summary: document.summary,
    changes: (document.changes ?? undefined) as FinanceAuditEntry['changes'],
    createdAt: isoDateTime(document.createdAt),
  };
}
