'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Receipt, RefreshCw, Trash2 } from 'lucide-react';
import { Badge } from '@/client/ui/components/ui/badge';
import { Button } from '@/client/ui/components/ui/button';
import { Skeleton } from '@/client/ui/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/client/ui/components/ui/table';
import {
  EmptyState,
  SectionCard,
  StatCard,
  WorkspaceError,
  WorkspacePage,
} from '@/client/features/dashboard/components/workspace-page';
import { ExpenseForm } from '@/client/features/finance/components/expense-form';
import { financeClientService } from '@/client/features/finance/services/finance-client.service';
import { formatDate, money, moneyExact, titleCase } from '@/client/features/finance/lib/format';
import { billboardClientService } from '@/client/features/billboards/services/billboard-client.service';
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_STATUSES,
  FINANCE_BASE_CURRENCY,
} from '@/shared/constants/finance';
import type { Billboard } from '@/shared/types/billboard';
import type { BillboardOwner, Expense, ExpenseStatus } from '@/shared/types/finance';

const inputClass =
  'rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

function statusBadge(status: ExpenseStatus) {
  if (status === EXPENSE_STATUSES.PAID) return <Badge variant="success">Paid</Badge>;
  if (status === EXPENSE_STATUSES.CANCELLED) return <Badge variant="muted">Cancelled</Badge>;
  return <Badge variant="warning">Pending</Badge>;
}

export function FinanceExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [owners, setOwners] = useState<BillboardOwner[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [expenseResult, billboardResult, ownerResult] = await Promise.all([
      financeClientService.listExpenses(),
      billboardClientService.list(),
      financeClientService.listOwners(),
    ]);

    if (!expenseResult.ok) {
      setError(expenseResult.error ?? 'We could not load expenses.');
      setStatus('error');
      return;
    }

    setExpenses(expenseResult.data?.expenses ?? []);
    if (billboardResult.ok) {
      setBillboards((billboardResult.data?.billboards as Billboard[] | undefined) ?? []);
    }
    if (ownerResult.ok) setOwners(ownerResult.data?.owners ?? []);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const categories = useMemo(
    () => [...new Set(expenses.map((expense) => expense.category))].sort(),
    [expenses],
  );

  const visible = expenses.filter((expense) => {
    if (statusFilter !== 'all' && expense.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && expense.category !== categoryFilter) return false;
    return true;
  });

  // Cancelled costs stay visible for the audit trail but never count as money
  // the company owes or has spent.
  const live = visible.filter((expense) => expense.status !== EXPENSE_STATUSES.CANCELLED);
  const total = live.reduce((sum, expense) => sum + expense.baseAmount, 0);
  const unpaid = live
    .filter((expense) => expense.status === EXPENSE_STATUSES.PENDING)
    .reduce((sum, expense) => sum + expense.baseAmount, 0);

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(`Delete "${expense.title}"? This cannot be undone.`)) return;
    setPendingId(expense.id);
    const result = await financeClientService.deleteExpense(expense.id);
    setPendingId(null);
    if (!result.ok) {
      setError(result.error ?? 'We could not delete this expense.');
      return;
    }
    await load();
  };

  return (
    <WorkspacePage
      eyebrow="Finance"
      title="Expenses"
      description="Every cost of running the network: rent, permits, power, maintenance, and overhead. Never advertiser payments."
      actions={
        <Button variant="outline" onClick={() => void load()} disabled={status === 'loading'}>
          <RefreshCw
            className={status === 'loading' ? 'size-4 animate-spin' : 'size-4'}
            aria-hidden
          />
          Refresh
        </Button>
      }
      canvas
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          index={0}
          icon={Receipt}
          accent="bg-rose-50 text-rose-700"
          label="Total (filtered)"
          value={money(total)}
          hint={`${live.length} active record(s)`}
        />
        <StatCard
          index={1}
          icon={Receipt}
          accent="bg-amber-50 text-amber-700"
          label="Unpaid"
          value={money(unpaid)}
          hint="Still owed"
        />
        <StatCard
          index={2}
          icon={Receipt}
          accent="bg-blue-50 text-blue-700"
          label="Categories in use"
          value={String(categories.length)}
          hint={`Reported in ${FINANCE_BASE_CURRENCY}`}
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <SectionCard
          title="Record an expense"
          description="Link it to a billboard to feed per-placement profitability."
        >
          <ExpenseForm billboards={billboards} owners={owners} onCreated={() => void load()} />
        </SectionCard>

        <SectionCard
          title="Recorded expenses"
          description="Newest first. Amounts shown in the reporting currency."
          action={
            <div className="flex flex-wrap gap-2">
              <select
                aria-label="Filter by status"
                className={inputClass}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                {Object.values(EXPENSE_STATUSES).map((value) => (
                  <option key={value} value={value}>
                    {titleCase(value)}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter by category"
                className={inputClass}
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {EXPENSE_CATEGORY_LABELS[category] ?? titleCase(category)}
                  </option>
                ))}
              </select>
            </div>
          }
          bodyClassName="px-0 pb-0"
        >
          {status === 'loading' ? (
            <div className="space-y-2 px-5 pb-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : null}

          {status === 'error' ? (
            <div className="px-5 pb-5">
              <WorkspaceError message={error ?? 'Unknown error.'} onRetry={() => void load()} />
            </div>
          ) : null}

          {status === 'ready' && visible.length === 0 ? (
            <div className="px-5 pb-5">
              <EmptyState
                icon={Receipt}
                title="No expenses match"
                description="Record your first cost, or clear the filters."
              />
            </div>
          ) : null}

          {status === 'ready' && visible.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <p className="font-medium">{expense.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {billboards.find((billboard) => billboard.id === expense.billboardId)
                            ?.name ?? 'Company-wide'}
                          {expense.recurrence !== 'one_off'
                            ? ` · ${titleCase(expense.recurrence)}`
                            : ''}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {EXPENSE_CATEGORY_LABELS[expense.category] ?? titleCase(expense.category)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {formatDate(expense.date)}
                      </TableCell>
                      <TableCell>{statusBadge(expense.status)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        <span className="font-medium">{moneyExact(expense.baseAmount)}</span>
                        {expense.currency !== FINANCE_BASE_CURRENCY ? (
                          <span className="text-muted-foreground block text-xs">
                            {expense.amount.toLocaleString()} {expense.currency}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Delete ${expense.title}`}
                          disabled={pendingId === expense.id}
                          onClick={() => void handleDelete(expense)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </SectionCard>
      </div>
    </WorkspacePage>
  );
}
