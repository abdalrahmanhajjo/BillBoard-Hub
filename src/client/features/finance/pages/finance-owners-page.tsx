'use client';

import { useCallback, useEffect, useState } from 'react';
import { Building2, Loader2, Plus, RefreshCw } from 'lucide-react';
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
import { formatDate, money } from '@/client/features/finance/lib/format';
import { FINANCE_CURRENCIES } from '@/shared/constants/finance';

const inputClass =
  'w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const labelClass = 'mb-1 block text-xs font-medium text-zinc-500';

export function FinanceOwnersPage() {
  const [owners, setOwners] = useState<OwnerWithBalance[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    contractReference: '',
    monthlyPayment: '',
    currency: 'USD',
  });

  const load = useCallback(async () => {
    const result = await financeClientService.listOwners();
    if (!result.ok) {
      setError(result.error ?? 'We could not load billboard owners.');
      setStatus('error');
      return;
    }
    setOwners(result.data?.owners ?? []);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setSaving(true);

    const result = await financeClientService.createOwner({
      name: form.name,
      companyName: form.companyName || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      contractReference: form.contractReference || undefined,
      monthlyPayment: form.monthlyPayment ? Number(form.monthlyPayment) : 0,
      currency: form.currency as (typeof FINANCE_CURRENCIES)[number],
    });

    setSaving(false);
    if (!result.ok) {
      setFormError(result.error ?? 'We could not add this owner.');
      return;
    }

    setForm({
      name: '',
      companyName: '',
      email: '',
      phone: '',
      contractReference: '',
      monthlyPayment: '',
      currency: 'USD',
    });
    await load();
  };

  const totalMonthly = owners
    .filter((owner) => owner.isActive)
    .reduce((sum, owner) => sum + owner.monthlyPayment, 0);
  const totalOutstanding = owners.reduce((sum, owner) => sum + owner.totalPending, 0);
  const totalOverdue = owners.reduce((sum, owner) => sum + owner.overdue, 0);

  return (
    <WorkspacePage
      eyebrow="Finance"
      title="Billboard owners"
      description="The landlords and site owners behind the network: contract terms, agreed monthly payments, and what is still outstanding."
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
          icon={Building2}
          accent="bg-blue-50 text-blue-700"
          label="Active owners"
          value={String(owners.filter((owner) => owner.isActive).length)}
          hint={`${owners.length} on file`}
        />
        <StatCard
          index={1}
          icon={Building2}
          accent="bg-cyan-50 text-cyan-700"
          label="Agreed monthly"
          value={money(totalMonthly)}
          hint="Across active contracts"
        />
        <StatCard
          index={2}
          icon={Building2}
          accent={totalOverdue > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}
          label="Outstanding"
          value={money(totalOutstanding)}
          hint={totalOverdue > 0 ? `${money(totalOverdue)} overdue` : 'Nothing overdue'}
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <SectionCard title="Add an owner" description="Record who the company pays for a site.">
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className={labelClass} htmlFor="owner-name">
                Name
              </label>
              <input
                id="owner-name"
                required
                className={inputClass}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Rami Haddad"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="owner-company">
                Company (optional)
              </label>
              <input
                id="owner-company"
                className={inputClass}
                value={form.companyName}
                onChange={(event) => setForm({ ...form, companyName: event.target.value })}
                placeholder="Haddad Properties SAL"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="owner-email">
                  Email
                </label>
                <input
                  id="owner-email"
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="owner-phone">
                  Phone
                </label>
                <input
                  id="owner-phone"
                  className={inputClass}
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="owner-monthly">
                  Monthly payment
                </label>
                <input
                  id="owner-monthly"
                  type="number"
                  step="0.01"
                  min="0"
                  className={inputClass}
                  value={form.monthlyPayment}
                  onChange={(event) => setForm({ ...form, monthlyPayment: event.target.value })}
                  placeholder="800.00"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="owner-currency">
                  Currency
                </label>
                <select
                  id="owner-currency"
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
            <div>
              <label className={labelClass} htmlFor="owner-contract">
                Contract reference (optional)
              </label>
              <input
                id="owner-contract"
                className={inputClass}
                value={form.contractReference}
                onChange={(event) => setForm({ ...form, contractReference: event.target.value })}
                placeholder="CTR-2026-014"
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

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Plus className="size-4" aria-hidden />
              )}
              {saving ? 'Saving…' : 'Add owner'}
            </Button>
          </form>
        </SectionCard>

        <SectionCard
          title="Owner directory"
          description="Balances are settled and outstanding totals in the reporting currency."
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

          {status === 'ready' && owners.length === 0 ? (
            <div className="px-5 pb-5">
              <EmptyState
                icon={Building2}
                title="No owners yet"
                description="Add the first site owner to start tracking what the company owes."
              />
            </div>
          ) : null}

          {status === 'ready' && owners.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Monthly</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {owners.map((owner) => (
                    <TableRow key={owner.id}>
                      <TableCell>
                        <p className="font-medium">{owner.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {owner.companyName ?? owner.email ?? '—'}
                          {owner.contractStartDate
                            ? ` · from ${formatDate(owner.contractStartDate)}`
                            : ''}
                        </p>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {money(owner.monthlyPayment, owner.currency)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {money(owner.totalPaid)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {owner.overdue > 0 ? (
                          <Badge variant="destructive">{money(owner.totalPending)}</Badge>
                        ) : (
                          money(owner.totalPending)
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={owner.isActive ? 'success' : 'muted'}>
                          {owner.isActive ? 'Active' : 'Inactive'}
                        </Badge>
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
