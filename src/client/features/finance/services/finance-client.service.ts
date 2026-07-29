import { apiRequest } from '@/client/ui/lib/api-client';
import type {
  CreateExpenseSchemaInput,
  UpdateExpenseSchemaInput,
} from '@/shared/contracts/finance/expense.schema';
import type {
  CreateOwnerPaymentSchemaInput,
  CreateOwnerSchemaInput,
  SettleOwnerPaymentSchemaInput,
  UpdateOwnerSchemaInput,
} from '@/shared/contracts/finance/owner.schema';
import type {
  BillboardOwner,
  Expense,
  FinanceAuditEntry,
  FinanceOverview,
  OwnerPayment,
} from '@/shared/types/finance';

export type OwnerWithBalance = BillboardOwner & {
  totalPaid: number;
  totalPending: number;
  overdue: number;
  paymentCount: number;
};

export type ExpenseFilters = {
  billboardId?: string;
  ownerId?: string;
  category?: string;
  status?: string;
  from?: string;
  to?: string;
};

function toQuery(filters: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const financeClientService = {
  getOverview(range: { from?: string; to?: string } = {}) {
    return apiRequest<{ overview: FinanceOverview }>(`/api/v1/finance/overview${toQuery(range)}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
  },

  listExpenses(filters: ExpenseFilters = {}) {
    return apiRequest<{ expenses: Expense[] }>(`/api/v1/finance/expenses${toQuery(filters)}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
  },

  createExpense(input: CreateExpenseSchemaInput) {
    return apiRequest<{ expense: Expense }>('/api/v1/finance/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    });
  },

  updateExpense(expenseId: string, input: UpdateExpenseSchemaInput) {
    return apiRequest<{ expense: Expense }>(
      `/api/v1/finance/expenses/${encodeURIComponent(expenseId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      },
    );
  },

  deleteExpense(expenseId: string) {
    return apiRequest<undefined>(`/api/v1/finance/expenses/${encodeURIComponent(expenseId)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  },

  listOwners() {
    return apiRequest<{ owners: OwnerWithBalance[] }>('/api/v1/finance/owners', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
  },

  createOwner(input: CreateOwnerSchemaInput) {
    return apiRequest<{ owner: BillboardOwner }>('/api/v1/finance/owners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    });
  },

  updateOwner(ownerId: string, input: UpdateOwnerSchemaInput) {
    return apiRequest<{ owner: BillboardOwner }>(
      `/api/v1/finance/owners/${encodeURIComponent(ownerId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      },
    );
  },

  deleteOwner(ownerId: string) {
    return apiRequest<undefined>(`/api/v1/finance/owners/${encodeURIComponent(ownerId)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  },

  listOwnerPayments(ownerId?: string) {
    return apiRequest<{ payments: OwnerPayment[] }>(
      `/api/v1/finance/owner-payments${toQuery({ ownerId })}`,
      { method: 'GET', credentials: 'include', cache: 'no-store' },
    );
  },

  createOwnerPayment(input: CreateOwnerPaymentSchemaInput) {
    return apiRequest<{ payment: OwnerPayment }>('/api/v1/finance/owner-payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    });
  },

  settleOwnerPayment(paymentId: string, input: SettleOwnerPaymentSchemaInput) {
    return apiRequest<{ payment: OwnerPayment }>(
      `/api/v1/finance/owner-payments/${encodeURIComponent(paymentId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      },
    );
  },

  listAudit(entityId?: string) {
    return apiRequest<{ entries: FinanceAuditEntry[] }>(
      `/api/v1/finance/audit${toQuery({ entityId })}`,
      { method: 'GET', credentials: 'include', cache: 'no-store' },
    );
  },
};
