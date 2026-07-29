import type {
  EXPENSE_CATEGORY_GROUPS,
  EXPENSE_PAYMENT_METHODS,
  EXPENSE_RECURRENCES,
  EXPENSE_STATUSES,
  FINANCE_AUDIT_ACTIONS,
  FINANCE_AUDIT_ENTITIES,
  FINANCE_CURRENCIES,
  OWNER_PAYMENT_STATUSES,
  PAYMENT_RECORD_TYPES,
} from '@/shared/constants/finance';

export type FinanceCurrency = (typeof FINANCE_CURRENCIES)[number];
export type ExpenseCategoryGroup =
  (typeof EXPENSE_CATEGORY_GROUPS)[keyof typeof EXPENSE_CATEGORY_GROUPS];
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[keyof typeof EXPENSE_STATUSES];
export type ExpensePaymentMethod =
  (typeof EXPENSE_PAYMENT_METHODS)[keyof typeof EXPENSE_PAYMENT_METHODS];
export type ExpenseRecurrence = (typeof EXPENSE_RECURRENCES)[keyof typeof EXPENSE_RECURRENCES];
export type PaymentRecordType = (typeof PAYMENT_RECORD_TYPES)[keyof typeof PAYMENT_RECORD_TYPES];
export type OwnerPaymentStatus =
  (typeof OWNER_PAYMENT_STATUSES)[keyof typeof OWNER_PAYMENT_STATUSES];
export type FinanceAuditAction = (typeof FINANCE_AUDIT_ACTIONS)[keyof typeof FINANCE_AUDIT_ACTIONS];
export type FinanceAuditEntity =
  (typeof FINANCE_AUDIT_ENTITIES)[keyof typeof FINANCE_AUDIT_ENTITIES];

export type ExpenseAttachment = {
  name: string;
  url: string;
};

export type Expense = {
  id: string;
  title: string;
  category: string;
  categoryGroup: ExpenseCategoryGroup;
  amount: number;
  currency: FinanceCurrency;
  /** Units of base currency per unit of `currency` at the time of the expense. */
  exchangeRate: number;
  /** `amount * exchangeRate`, denormalised so reports never re-derive FX. */
  baseAmount: number;
  recurrence: ExpenseRecurrence;
  status: ExpenseStatus;
  paymentMethod: ExpensePaymentMethod;
  /** Calendar date the cost belongs to, ISO `YYYY-MM-DD`. */
  date: string;
  billboardId?: string;
  ownerId?: string;
  vendorName?: string;
  referenceNumber?: string;
  notes?: string;
  attachments: ExpenseAttachment[];
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BillboardOwner = {
  id: string;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  contractReference?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  /** Agreed recurring payment, in `currency`. */
  monthlyPayment: number;
  currency: FinanceCurrency;
  notes?: string;
  isActive: boolean;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
};

export type OwnerPayment = {
  id: string;
  ownerId: string;
  billboardId?: string;
  amount: number;
  currency: FinanceCurrency;
  exchangeRate: number;
  baseAmount: number;
  dueDate: string;
  paidDate?: string;
  status: OwnerPaymentStatus;
  paymentMethod?: ExpensePaymentMethod;
  referenceNumber?: string;
  notes?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Unified row for the payments screen: expenses and owner payments together. */
export type PaymentRecord = {
  id: string;
  type: PaymentRecordType;
  recipient: string;
  amount: number;
  currency: FinanceCurrency;
  baseAmount: number;
  date: string;
  status: ExpenseStatus | OwnerPaymentStatus;
  paymentMethod?: ExpensePaymentMethod;
  referenceNumber?: string;
  billboardId?: string;
};

export type CategoryTotal = {
  category: string;
  label: string;
  group: ExpenseCategoryGroup;
  baseAmount: number;
  count: number;
};

export type MonthlyFinancePoint = {
  month: string;
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
};

export type BillboardProfitability = {
  billboardId: string;
  name: string;
  city: string;
  type: string;
  revenue: number;
  bookings: number;
  /** Share of days in the window covered by a blocking reservation, 0–1. */
  occupancyRate: number;
  expenses: number;
  netProfit: number;
  /** `netProfit / revenue`; null when there is no revenue to divide by. */
  margin: number | null;
};

export type FinanceOverview = {
  baseCurrency: string;
  /** Inclusive ISO date window the figures cover. */
  window: { from: string; to: string };
  revenue: { total: number; currentMonth: number; currentYear: number; bookings: number };
  expenses: { total: number; currentMonth: number; pending: number; paid: number };
  profit: { gross: number; net: number; margin: number | null };
  ownerObligations: { dueThisMonth: number; overdue: number; pendingCount: number };
  byCategory: CategoryTotal[];
  monthly: MonthlyFinancePoint[];
  billboards: BillboardProfitability[];
};

export type FinanceAuditEntry = {
  id: string;
  entity: FinanceAuditEntity;
  entityId: string;
  action: FinanceAuditAction;
  actorId: string;
  actorEmail?: string;
  summary: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  createdAt?: string;
};
