'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/client/ui/components/ui/button';
import { Textarea } from '@/client/ui/components/ui/textarea';
import { financeClientService } from '@/client/features/finance/services/finance-client.service';
import { titleCase } from '@/client/features/finance/lib/format';
import {
  createExpenseSchema,
  type CreateExpenseSchemaInput,
} from '@/shared/contracts/finance/expense.schema';
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_PAYMENT_METHODS,
  EXPENSE_RECURRENCES,
  EXPENSE_STATUSES,
  FINANCE_BASE_CURRENCY,
  FINANCE_CURRENCIES,
} from '@/shared/constants/finance';
import type { Billboard } from '@/shared/types/billboard';
import type { BillboardOwner } from '@/shared/types/finance';

const inputClass =
  'w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const labelClass = 'mb-1 block text-xs font-medium text-zinc-500';

type ExpenseFormProps = {
  billboards: Billboard[];
  owners: BillboardOwner[];
  onCreated: () => void;
};

export function ExpenseForm({ billboards, owners, onCreated }: ExpenseFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateExpenseSchemaInput>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      title: '',
      category: EXPENSE_CATEGORIES.LOCATION_RENT,
      amount: undefined,
      currency: FINANCE_BASE_CURRENCY,
      recurrence: EXPENSE_RECURRENCES.MONTHLY,
      status: EXPENSE_STATUSES.PENDING,
      paymentMethod: EXPENSE_PAYMENT_METHODS.BANK_TRANSFER,
      date: new Date().toISOString().slice(0, 10),
      attachments: [],
    },
  });

  const currency = watch('currency');
  const needsRate = currency !== FINANCE_BASE_CURRENCY;

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    setSubmitting(true);

    const payload: CreateExpenseSchemaInput = {
      ...values,
      amount: Number(values.amount),
      exchangeRate: values.exchangeRate ? Number(values.exchangeRate) : undefined,
      billboardId: values.billboardId || undefined,
      ownerId: values.ownerId || undefined,
      vendorName: values.vendorName || undefined,
      referenceNumber: values.referenceNumber || undefined,
      notes: values.notes || undefined,
    };

    const result = await financeClientService.createExpense(payload);
    setSubmitting(false);

    if (!result.ok) {
      setServerError(result.error ?? 'We could not record this expense.');
      return;
    }

    reset();
    onCreated();
  });

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className={labelClass} htmlFor="expense-title">
          Title
        </label>
        <input
          id="expense-title"
          className={inputClass}
          placeholder="Downtown screen — March rent"
          {...register('title')}
        />
        {errors.title ? <p className="mt-1 text-xs text-red-600">{errors.title.message}</p> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="expense-category">
            Category
          </label>
          <select id="expense-category" className={inputClass} {...register('category')}>
            {Object.values(EXPENSE_CATEGORIES).map((category) => (
              <option key={category} value={category}>
                {EXPENSE_CATEGORY_LABELS[category] ?? titleCase(category)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="expense-recurrence">
            Recurrence
          </label>
          <select id="expense-recurrence" className={inputClass} {...register('recurrence')}>
            {Object.values(EXPENSE_RECURRENCES).map((value) => (
              <option key={value} value={value}>
                {titleCase(value)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="expense-amount">
            Amount
          </label>
          <input
            id="expense-amount"
            type="number"
            step="0.01"
            min="0"
            className={inputClass}
            placeholder="800.00"
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount ? (
            <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>
          ) : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="expense-currency">
            Currency
          </label>
          <select id="expense-currency" className={inputClass} {...register('currency')}>
            {FINANCE_CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="expense-date">
            Date
          </label>
          <input id="expense-date" type="date" className={inputClass} {...register('date')} />
          {errors.date ? <p className="mt-1 text-xs text-red-600">{errors.date.message}</p> : null}
        </div>
      </div>

      {needsRate ? (
        <div>
          <label className={labelClass} htmlFor="expense-rate">
            Exchange rate to {FINANCE_BASE_CURRENCY}
          </label>
          <input
            id="expense-rate"
            type="number"
            step="0.000001"
            min="0"
            className={inputClass}
            placeholder="0.000011"
            {...register('exchangeRate', { valueAsNumber: true })}
          />
          <p className="mt-1 text-xs text-zinc-500">
            Required so this cost can be compared with {FINANCE_BASE_CURRENCY} revenue. 1 {currency}{' '}
            = ? {FINANCE_BASE_CURRENCY}
          </p>
          {errors.exchangeRate ? (
            <p className="mt-1 text-xs text-red-600">{errors.exchangeRate.message}</p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="expense-billboard">
            Billboard (optional)
          </label>
          <select id="expense-billboard" className={inputClass} {...register('billboardId')}>
            <option value="">Not billboard-specific</option>
            {billboards.map((billboard) => (
              <option key={billboard.id} value={billboard.id}>
                {billboard.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="expense-owner">
            Owner / vendor (optional)
          </label>
          <select id="expense-owner" className={inputClass} {...register('ownerId')}>
            <option value="">None</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="expense-status">
            Status
          </label>
          <select id="expense-status" className={inputClass} {...register('status')}>
            {Object.values(EXPENSE_STATUSES).map((value) => (
              <option key={value} value={value}>
                {titleCase(value)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="expense-method">
            Payment method
          </label>
          <select id="expense-method" className={inputClass} {...register('paymentMethod')}>
            {Object.values(EXPENSE_PAYMENT_METHODS).map((value) => (
              <option key={value} value={value}>
                {titleCase(value)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="expense-notes">
          Notes (optional)
        </label>
        <Textarea
          id="expense-notes"
          rows={2}
          placeholder="Contract reference, meter reading, anything worth keeping."
          {...register('notes')}
        />
      </div>

      {serverError ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {serverError}
        </p>
      ) : null}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Plus className="size-4" aria-hidden />
        )}
        {submitting ? 'Saving…' : 'Record expense'}
      </Button>
    </form>
  );
}
