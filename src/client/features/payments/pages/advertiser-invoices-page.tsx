'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Loader2, Receipt, RefreshCw } from 'lucide-react';
import { Button } from '@/client/ui/components/ui/button';
import { ADVERTISER_ROUTES } from '@/shared/constants/routes';
import { BOOKING_STATUSES, PAYMENT_STATUSES } from '@/shared/constants/booking';
import type { Booking, PaymentStatus } from '@/shared/types/booking';
import { useAdvertiserWorkspace } from '@/client/features/dashboard/hooks/use-advertiser-workspace';
import {
  EmptyState,
  StatCard,
  WorkspacePage,
} from '@/client/features/dashboard/components/workspace-page';
import { ListToolbar } from '@/client/features/dashboard/components/list-toolbar';
import { buildCsv, downloadCsv } from '@/client/features/dashboard/utils/csv-export';
import {
  formatCurrency,
  formatDate,
  formatTotals,
  outstandingBookings,
  sumByCurrency,
} from '@/client/features/dashboard/utils/advertiser-metrics';

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  partially_paid: 'border-sky-200 bg-sky-50 text-sky-700',
  unpaid: 'border-rose-200 bg-rose-50 text-rose-700',
  refund_pending: 'border-violet-200 bg-violet-50 text-violet-700',
  refunded: 'border-zinc-200 bg-zinc-100 text-zinc-600',
};

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pending: 'Payment due',
  paid: 'Paid',
  partially_paid: 'Partially paid',
  unpaid: 'Payment due',
  refund_pending: 'Refund processing',
  refunded: 'Refunded',
};

/**
 * Invoices are a projection of reservations: each booking already carries its
 * own reference, billing details, pricing breakdown, and payment status, and the
 * API exposes no separate invoice collection to list.
 */
type SortKey = 'issued-desc' | 'issued-asc' | 'total-desc' | 'total-asc';

const SORTERS: Record<SortKey, (a: Booking, b: Booking) => number> = {
  'issued-desc': (a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
  'issued-asc': (a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''),
  'total-desc': (a, b) => (b.pricing?.total ?? 0) - (a.pricing?.total ?? 0),
  'total-asc': (a, b) => (a.pricing?.total ?? 0) - (b.pricing?.total ?? 0),
};

export function AdvertiserInvoicesFeaturePage() {
  const { bookings, status, error, reload } = useAdvertiserWorkspace();
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('issued-desc');

  const allInvoices = bookings.filter((booking) => booking.status !== BOOKING_STATUSES.CANCELLED);
  const paid = allInvoices.filter((booking) => booking.paymentStatus === PAYMENT_STATUSES.PAID);
  const outstanding = outstandingBookings(bookings);

  // Left unmemoized on purpose: React Compiler handles this, and a manual
  // useMemo here is one it cannot preserve.
  const searchTerm = search.trim().toLowerCase();
  const invoices = [...allInvoices]
    .filter((booking) => {
      if (paymentFilter !== 'all' && booking.paymentStatus !== paymentFilter) return false;
      if (!searchTerm) return true;
      return (
        booking.reference.toLowerCase().includes(searchTerm) ||
        booking.campaignName.toLowerCase().includes(searchTerm) ||
        (booking.invoice?.poNumber ?? '').toLowerCase().includes(searchTerm)
      );
    })
    .sort(SORTERS[sortKey]);

  const handleExport = () => {
    const csv = buildCsv(invoices, [
      { header: 'Reference', value: (booking) => booking.reference },
      { header: 'Campaign', value: (booking) => booking.campaignName },
      { header: 'PO number', value: (booking) => booking.invoice?.poNumber ?? '' },
      { header: 'Start date', value: (booking) => booking.startDate },
      { header: 'End date', value: (booking) => booking.endDate },
      { header: 'Issued', value: (booking) => booking.createdAt ?? '' },
      { header: 'Days', value: (booking) => booking.pricing?.days ?? 0 },
      { header: 'Subtotal', value: (booking) => booking.pricing?.subtotal ?? 0 },
      { header: 'Service fee', value: (booking) => booking.pricing?.serviceFee ?? 0 },
      { header: 'VAT', value: (booking) => booking.pricing?.vat ?? 0 },
      { header: 'Total', value: (booking) => booking.pricing?.total ?? 0 },
      {
        header: 'Currency',
        value: (booking) => booking.invoice?.currency ?? booking.pricing?.currency ?? 'USD',
      },
      { header: 'Payment status', value: (booking) => booking.paymentStatus },
      { header: 'Reservation status', value: (booking) => booking.status },
    ]);

    downloadCsv(`boardly-invoices-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <WorkspacePage
      title="Invoices"
      description="Billing records generated from your reservations, with the amount due on each."
      actions={
        <Button variant="outline" onClick={reload} disabled={status === 'loading'}>
          <RefreshCw
            className={status === 'loading' ? 'size-4 animate-spin' : 'size-4'}
            aria-hidden
          />
          Refresh
        </Button>
      }
    >
      {status === 'error' ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/8 text-destructive mb-6 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      ) : null}

      {status === 'loading' ? (
        <div className="text-muted-foreground flex items-center gap-2 py-16 text-sm">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading invoices...
        </div>
      ) : allInvoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No invoices yet"
          description="An invoice appears here as soon as you submit a reservation."
          action={
            <Button render={<Link href={ADVERTISER_ROUTES.BILLBOARDS} />} nativeButton={false}>
              Browse billboards
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={Receipt} label="Invoices" value={String(allInvoices.length)} />
            <StatCard
              icon={Receipt}
              label="Outstanding"
              value={formatTotals(sumByCurrency(outstanding))}
              hint={`${outstanding.length} awaiting payment`}
            />
            <StatCard
              icon={Receipt}
              label="Settled"
              value={formatTotals(sumByCurrency(paid))}
              hint={`${paid.length} paid`}
            />
          </div>

          <div>
            <ListToolbar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search reference, campaign, or PO number"
              summary={`${invoices.length} of ${allInvoices.length}`}
              onExport={invoices.length > 0 ? handleExport : undefined}
              filters={[
                {
                  id: 'invoice-payment-filter',
                  label: 'Payment',
                  value: paymentFilter,
                  onChange: setPaymentFilter,
                  options: [
                    { value: 'all', label: 'All' },
                    ...Object.values(PAYMENT_STATUSES).map((value) => ({
                      value,
                      label: PAYMENT_LABELS[value],
                    })),
                  ],
                },
                {
                  id: 'invoice-sort',
                  label: 'Sort by',
                  value: sortKey,
                  onChange: (value) => setSortKey(value as SortKey),
                  options: [
                    { value: 'issued-desc', label: 'Newest first' },
                    { value: 'issued-asc', label: 'Oldest first' },
                    { value: 'total-desc', label: 'Highest total' },
                    { value: 'total-asc', label: 'Lowest total' },
                  ],
                },
              ]}
            />

            {invoices.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No invoices match those filters"
                description="Try a different search term or payment status."
              />
            ) : (
              <div className="bg-card overflow-hidden rounded-xl border">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-3xl text-sm">
                    <thead className="bg-muted/50 text-muted-foreground text-left text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3 font-medium">Reference</th>
                        <th className="px-4 py-3 font-medium">Campaign</th>
                        <th className="px-4 py-3 font-medium">Period</th>
                        <th className="px-4 py-3 font-medium">Issued</th>
                        <th className="px-4 py-3 text-right font-medium">Total</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {invoices.map((booking) => (
                        <InvoiceRow key={booking.id} booking={booking} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <p className="text-muted-foreground text-xs">
            Totals include the service fee and VAT calculated at reservation time.
          </p>
        </div>
      )}
    </WorkspacePage>
  );
}

function InvoiceRow({ booking }: { booking: Booking }) {
  const currency = booking.invoice?.currency ?? booking.pricing?.currency ?? 'USD';

  return (
    <tr>
      <td className="px-4 py-3 font-mono text-xs">{booking.reference}</td>
      <td className="px-4 py-3">
        <span className="font-medium">{booking.campaignName}</span>
        {booking.invoice?.poNumber ? (
          <span className="text-muted-foreground block text-xs">PO {booking.invoice.poNumber}</span>
        ) : null}
      </td>
      <td className="text-muted-foreground px-4 py-3 text-xs whitespace-nowrap">
        {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
      </td>
      <td className="text-muted-foreground px-4 py-3 text-xs whitespace-nowrap">
        {formatDate(booking.createdAt)}
      </td>
      <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
        {formatCurrency(booking.pricing?.total ?? 0, currency)}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${PAYMENT_STYLES[booking.paymentStatus]}`}
        >
          {PAYMENT_LABELS[booking.paymentStatus]}
        </span>
      </td>
    </tr>
  );
}
