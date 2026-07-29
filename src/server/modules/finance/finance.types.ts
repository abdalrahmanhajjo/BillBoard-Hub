import type {
  ExpensePaymentMethod,
  ExpenseRecurrence,
  ExpenseStatus,
  FinanceAuditAction,
  FinanceAuditEntity,
  FinanceCurrency,
  OwnerPaymentStatus,
} from '@/shared/types/finance';

export type ExpenseAttachmentRecord = {
  name: string;
  url: string;
};

export type ExpenseRecord = {
  title: string;
  category: string;
  categoryGroup: string;
  amount: number;
  currency: FinanceCurrency;
  exchangeRate: number;
  baseAmount: number;
  recurrence: ExpenseRecurrence;
  status: ExpenseStatus;
  paymentMethod: ExpensePaymentMethod;
  date: Date;
  billboardId?: string;
  ownerId?: string;
  vendorName?: string;
  referenceNumber?: string;
  notes?: string;
  attachments: ExpenseAttachmentRecord[];
  createdBy: string;
};

export type OwnerRecord = {
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  contractReference?: string;
  contractStartDate?: Date;
  contractEndDate?: Date;
  monthlyPayment: number;
  currency: FinanceCurrency;
  notes?: string;
  isActive: boolean;
  createdBy: string;
};

export type OwnerPaymentRecord = {
  ownerId: string;
  billboardId?: string;
  amount: number;
  currency: FinanceCurrency;
  exchangeRate: number;
  baseAmount: number;
  dueDate: Date;
  paidDate?: Date;
  status: OwnerPaymentStatus;
  paymentMethod?: ExpensePaymentMethod;
  referenceNumber?: string;
  notes?: string;
  createdBy: string;
};

export type FinanceAuditRecord = {
  entity: FinanceAuditEntity;
  entityId: string;
  action: FinanceAuditAction;
  actorId: string;
  actorEmail?: string;
  summary: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
};

export type ExpenseFilter = {
  billboardId?: string;
  ownerId?: string;
  category?: string;
  status?: ExpenseStatus;
  from?: Date;
  to?: Date;
};

/** Revenue rolled up per billboard from confirmed reservations. */
export type BillboardRevenueRow = {
  billboardId: string;
  revenue: number;
  bookings: number;
  bookedDays: number;
};

export type MonthlyAmountRow = {
  month: string;
  amount: number;
};
