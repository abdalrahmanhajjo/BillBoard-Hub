'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Banknote, CheckCircle2, Loader2, Plus, RefreshCw } from 'lucide-react';
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
import {
  financeClientService,
  type OwnerWithBalance,
} from '@/client/features/finance/services/finance-client.service';
import { formatDate, money, titleCase } from '@/client/features/finance/lib/format';
import {
  EXPENSE_PAYMENT_METHODS,
  FINANCE_CURRENCIES,
  OWNER_PAYMENT_STATUSES,
} from '@/shared/constants/finance';
import type { OwnerPayment, OwnerPaymentStatus } from '@/shared/types/finance';

const inputClass =
  'w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const labelClass = 'mb-1 block text-xs font-medium text-zinc-500';

function statusBadge(status: OwnerPaymentStatus, overdue: boolean) {
  if (status === OWNER_PAYMENT_STATUSES.PAID) return <Badge variant="success">Paid</Badge>;
  if (status === OWNER_PAYMENT_STATUSES.CANCELLED) return <Badge variant="muted">Cancelled</Badge>;
  return overdue ? (
    <Badge variant="destructive">Overdue</Badge>
  ) : (
    <Badge variant="warning">Pending</Badge>
  );
}

export function FinancePaymentsPage() {
  const [payments, setPayments] = useState<OwnerPayment[]>([]);
  const [owners, setOwners] = useState<OwnerWithBalance[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    ownerId: '',
    amount: '',
    currency: 'USD',
    exchangeRate: '',
    dueDate: new Date().toISOString().slice(0, 10),
    paymentMethod: EXPENSE_PAYMENT_METHODS.BANK_TRANSFER as string,
    referenceNumber: '',
  });

  const load = useCallback(async () => {
    const [paymentResult, ownerResult] = await Promise.all([
      financeClientService.listOwnerPayments(),
      financeClientService.listOwners(),
    ]);

    if (!paymentResult.ok) {
      setError(paymentResult.error ?? 'We could not load payments.');
      setStatus('error');
      return;
    }

    setPayments(paymentResult.data?.payments ?? []);
    if (ownerResult.ok) setOwners(ownerResult.data?.owners ?? []);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const ownersById = useMemo(() => new Map(owners.map((owner) => [owner.id, owner])), [owners]);
  const today = new Date().toISOString().slice(0, 10);

  const pending = payments.filter((payment) => payment.status === OWNER_PAYMENT_STATUSES.PENDING);
  const overdue = pending.filter((payment) => payment.dueDate < today);
  const paidTotal = payments
    .filter((payment) => payment.status === OWNER_PAYMENT_STATUSES.PAID)
    .reduce((sum, payment) => sum + payment.baseAmount, 0);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setSaving(true);

    const result = await financeClientService.createOwnerPayment({
      ownerId: form.ownerId,
      amount: Number(form.amount),
      currency: form.currency as (typeof FINANCE_CURRENCIES)[number],
      exchangeRate: form.exchangeRate ? Number(form.exchangeRate) : undefined,
      dueDate: form.dueDate,
      paymentMethod: form.paymentMethod as never,
      referenceNumber: form.referenceNumber || undefined,
    });

    setSaving(false);
    if (!result.ok) {
      setFormError(result.error ?? 'We could not schedule this payment.');
      return;
    }

    setForm({ ...form, amount: '', referenceNumber: '', exchangeRate: '' });
    await load();
  };

  const settle = async (payment: OwnerPayment) => {
    setSettlingId(payment.id);
    const result = await financeClientService.settleOwnerPayment(payment.id, {
      status: OWNER_PAYMENT_STATUSES.PAID,
      paidDate: new Date().toISOString().slice(0, 10),
      paymentMethod: payment.paymentMethod,
    });
    setSettlingId(null);

    if (!result.ok) {
      setError(result.error ?? 'We could not update this payment.');
      return;
    }
    await load();
  };

  return (
    <WorkspacePage
      eyebrow="Finance"
      title="Payments"
      description="Money the company owes and has paid out — owner payouts and vendor settlements. Advertiser payments live under Reservations."
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
          icon={Banknote}
          accent="bg-amber-50 text-amber-700"
          label="Scheduled"
          value={money(pending.reduce((sum, payment) => sum + payment.baseAmount, 0))}
          hint={`${pending.length} pending`}
        />
        <StatCard
          index={1}
          icon={Banknote}
          accent={
            overdue.length > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
          }
          label="Overdue"
          value={money(overdue.reduce((sum, payment) => sum + payment.baseAmount, 0))}
          hint={`${overdue.length} past due date`}
        />
        <StatCard
          index={2}
          icon={CheckCircle2}
          accent="bg-emerald-50 text-emerald-700"
          label="Settled"
          value={money(paidTotal)}
          hint="Paid to date"
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <SectionCard
          title="Schedule a payment"
          description="Record what is owed and when it falls due."
        >
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className={labelClass} htmlFor="payment-owner">
                Recipient
              </label>
              <select
                id="payment-owner"
                required
                className={inputClass}
                value={form.ownerId}
                onChange={(event) => setForm({ ...form, ownerId: event.target.value })}
              >
                <option value="">Choose an owner…</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
              </select>
              {owners.length === 0 ? (
                <p className="mt-1 text-xs text-amber-700">
                  Add a billboard owner first — payments need a recipient.
                </p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="payment-amount">
                  Amount
                </label>
                <input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className={inputClass}
                  value={form.amount}
                  onChange={(event) => setForm({ ...form, amount: event.target.value })}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="payment-currency">
                  Currency
                </label>
                <select
                  id="payment-currency"
                  className={inputClass}
                  value={form.currency}
                  onChange={(event) => setForm({ ...form, currency: event.target.value })}
                >
                  {FINANCE_CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {form.currency !== 'USD' ? (
              <div>
                <label className={labelClass} htmlFor="payment-rate">
                  Exchange rate to USD
                </label>
                <input
                  id="payment-rate"
                  type="number"
                  step="0.000001"
                  min="0"
                  className={inputClass}
                  value={form.exchangeRate}
                  onChange={(event) => setForm({ ...form, exchangeRate: event.target.value })}
                />
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="payment-due">
                  Due date
                </label>
                <input
                  id="payment-due"
                  type="date"
                  required
                  className={inputClass}
                  value={form.dueDate}
                  onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="payment-method">
                  Method
                </label>
                <select
                  id="payment-method"
                  className={inputClass}
                  value={form.paymentMethod}
                  onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}
                >
                  {Object.values(EXPENSE_PAYMENT_METHODS).map((value) => (
                    <option key={value} value={value}>
                      {titleCase(value)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="payment-reference">
                Reference number (optional)
              </label>
              <input
                id="payment-reference"
                className={inputClass}
                value={form.referenceNumber}
                onChange={(event) => setForm({ ...form, referenceNumber: event.target.value })}
                placeholder="TRF-2026-0042"
              />
            </div>

            {formError ? (
              <p
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {formError}
              </p>
            ) : null}

            <Button type="submit" disabled={saving || owners.length === 0} className="w-full">
              {saving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Plus className="size-4" aria-hidden />
              )}
              {saving ? 'Saving…' : 'Schedule payment'}
            </Button>
          </form>
        </SectionCard>

        <SectionCard
          title="Payment records"
          description="Newest due date first. Marking one paid stamps today's date."
          bodyClassName="px-0 pb-0"
        >
          {status === 'loading' ? (
            <div className="space-y-2 px-5 pb-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : null}

          {status === 'error' ? (
            <div className="px-5 pb-5">
              <WorkspaceError message={error ?? 'Unknown error.'} onRetry={() => void load()} />
            </div>
          ) : null}

          {status === 'ready' && payments.length === 0 ? (
            <div className="px-5 pb-5">
              <EmptyState
                icon={Banknote}
                title="No payments scheduled"
                description="Schedule what the company owes so nothing slips past its due date."
              />
            </div>
          ) : null}

          {status === 'ready' && payments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <p className="font-medium">
                          {ownersById.get(payment.ownerId)?.name ?? 'Unknown owner'}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {payment.referenceNumber ??
                            (payment.paymentMethod ? titleCase(payment.paymentMethod) : '—')}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {formatDate(payment.dueDate)}
                      </TableCell>
                      <TableCell>
                        {statusBadge(
                          payment.status,
                          payment.status === OWNER_PAYMENT_STATUSES.PENDING &&
                            payment.dueDate < today,
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {money(payment.baseAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.status === OWNER_PAYMENT_STATUSES.PENDING ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={settlingId === payment.id}
                            onClick={() => void settle(payment)}
                          >
                            {settlingId === payment.id ? 'Saving…' : 'Mark paid'}
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            {payment.paidDate ? formatDate(payment.paidDate) : '—'}
                          </span>
                        )}
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
