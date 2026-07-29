'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowDownToLine,
  Building2,
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock3,
  Mail,
  MapPin,
  RefreshCcw,
  Search,
  X,
} from 'lucide-react';
import { bookingClientService } from '@/client/features/bookings/services/booking-client.service';
import { billboardClientService } from '@/client/features/billboards/services/billboard-client.service';
import { paymentClientService } from '@/client/features/payments/services/payment-client.service';
import { Badge } from '@/client/ui/components/ui/badge';
import { Button } from '@/client/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/client/ui/components/ui/card';
import { Input } from '@/client/ui/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/ui/components/ui/select';
import { Skeleton } from '@/client/ui/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/client/ui/components/ui/table';
import { cn } from '@/client/ui/lib/utils';
import type { Billboard } from '@/shared/types/billboard';
import type { Booking, BookingStatus, PaymentMethod, PaymentStatus } from '@/shared/types/booking';
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '@/shared/constants/booking';

const ALL = 'all';
const statusText: Record<BookingStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
const paymentText: Record<PaymentStatus, string> = {
  pending: 'Awaiting payment',
  paid: 'Paid',
  partially_paid: 'Partially paid',
  unpaid: 'Unpaid',
  refund_pending: 'Refund processing',
  refunded: 'Refunded',
};
const methodText: Record<PaymentMethod, string> = {
  card: 'Visa · Stripe',
  bank_transfer: 'Bank transfer',
  e_wallet: 'Cash / Whish',
  cash: 'Cash',
};
type Row = Booking & { billboard?: Billboard };

const money = (value: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    value,
  );
const date = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
function bookingBadge(status: BookingStatus) {
  const colors: Record<BookingStatus, string> = {
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rejected: 'border-rose-200 bg-rose-50 text-rose-700',
    completed: 'border-sky-200 bg-sky-50 text-sky-700',
    cancelled: 'border-slate-200 bg-slate-100 text-slate-600',
  };
  return (
    <Badge variant="outline" className={colors[status]}>
      {statusText[status]}
    </Badge>
  );
}
function paymentBadge(status: PaymentStatus) {
  const colors: Record<PaymentStatus, string> = {
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    partially_paid: 'border-sky-200 bg-sky-50 text-sky-700',
    unpaid: 'border-rose-200 bg-rose-50 text-rose-700',
    refund_pending: 'border-violet-200 bg-violet-50 text-violet-700',
    refunded: 'border-slate-200 bg-slate-100 text-slate-600',
  };
  return (
    <Badge variant="outline" className={colors[status]}>
      {paymentText[status]}
    </Badge>
  );
}

export function AdminBookingsPage() {
  const reduceMotion = useReducedMotion();
  const client = useQueryClient();
  const [status, setStatus] = useState<BookingStatus | typeof ALL>(ALL);
  const [billboardId, setBillboardId] = useState(ALL);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Row | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const bookingsQuery = useQuery({
    queryKey: ['admin-bookings', status],
    queryFn: async () => {
      const result = await bookingClientService.list(status === ALL ? {} : { status });
      if (!result.ok) throw new Error(result.error);
      return (result.data?.bookings ?? []) as Booking[];
    },
  });
  const billboardsQuery = useQuery({
    queryKey: ['admin-booking-billboards'],
    queryFn: async () => {
      const result = await billboardClientService.list();
      if (!result.ok) throw new Error(result.error);
      return (result.data?.billboards ?? []) as Billboard[];
    },
  });
  const update = useMutation({
    mutationFn: ({ id, status: next }: { id: string; status: 'approved' | 'rejected' }) =>
      bookingClientService.updateStatus(id, next),
    onSuccess: (result, variables) => {
      if (!result.ok) {
        setNotice(result.error ?? null);
        return;
      }
      setNotice(`Reservation ${variables.status}.`);
      setSelected((value) =>
        value?.id === variables.id ? { ...value, status: variables.status } : value,
      );
      void client.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
    onError: () => setNotice('Unable to update this reservation.'),
  });
  const reconcilePayment = useMutation({
    mutationFn: ({
      id,
      status: paymentStatus,
      amountPaid,
      note,
    }: {
      id: string;
      status: Extract<PaymentStatus, 'paid' | 'partially_paid' | 'unpaid' | 'refunded'>;
      amountPaid?: number;
      note?: string;
    }) =>
      paymentClientService.recordManualPayment(id, {
        status: paymentStatus,
        amountPaid,
        note,
      }),
    onSuccess: (result) => {
      if (!result.ok || !result.data) {
        setNotice(result.error ?? 'We could not record this payment.');
        return;
      }
      const booking = result.data.booking;
      setNotice(`Payment updated to ${paymentText[booking.paymentStatus].toLowerCase()}.`);
      setSelected((value) => (value?.id === booking.id ? { ...value, ...booking } : value));
      void client.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
    onError: () => setNotice('We could not record this payment. Review the details and try again.'),
  });
  const refundPayment = useMutation({
    mutationFn: (id: string) => paymentClientService.refundCardPayment(id, 'requested_by_customer'),
    onSuccess: (result, bookingId) => {
      if (!result.ok || !result.data) {
        setNotice(result.error ?? 'We could not start this refund.');
        return;
      }
      const refundPending = result.data.payment.status === 'REFUND_PENDING';
      setNotice(
        refundPending
          ? 'Stripe is processing the refund. The reservation remains active until Stripe confirms it.'
          : 'Stripe refunded the payment and cancelled the reservation.',
      );
      setSelected((value) =>
        value?.id === bookingId
          ? {
              ...value,
              status: refundPending ? value.status : 'cancelled',
              paymentStatus: refundPending ? 'refund_pending' : 'refunded',
            }
          : value,
      );
      void client.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
    onError: () => setNotice('We could not issue this refund. Check Stripe and try again.'),
  });
  const billboards = useMemo(() => billboardsQuery.data ?? [], [billboardsQuery.data]);
  const rows = useMemo(() => {
    const lookup = new Map(billboards.map((item) => [item.id, item]));
    const term = search.trim().toLowerCase();
    return (bookingsQuery.data ?? [])
      .map((item) => ({ ...item, billboard: lookup.get(item.billboardId) }))
      .filter((item) => billboardId === ALL || item.billboardId === billboardId)
      .filter(
        (item) =>
          !term ||
          [
            item.reference,
            item.company.name,
            item.billing.email,
            item.campaignName,
            item.billboard?.name,
            item.billboard?.location.city,
          ]
            .join(' ')
            .toLowerCase()
            .includes(term),
      );
  }, [billboardId, billboards, bookingsQuery.data, search]);
  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: 'reference',
        header: 'Reference',
        cell: ({ row }) => (
          <button
            onClick={() => setSelected(row.original)}
            className="font-medium text-blue-700 hover:underline"
          >
            {row.original.reference}
          </button>
        ),
      },
      {
        id: 'advertiser',
        header: 'Advertiser',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-900">{row.original.company.name}</p>
            <p className="text-xs text-slate-500">{row.original.billing.email}</p>
          </div>
        ),
      },
      {
        id: 'billboard',
        header: 'Billboard / location',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-800">
              {row.original.billboard?.name ?? 'Unassigned billboard'}
            </p>
            <p className="text-xs text-slate-500">
              {row.original.billboard
                ? `${row.original.billboard.location.city}, ${row.original.billboard.location.country}`
                : 'Location unavailable'}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'startDate',
        header: 'Reservation date',
        cell: ({ row }) => (
          <div>
            <p>{date(row.original.startDate)}</p>
            <p className="text-xs text-slate-500">to {date(row.original.endDate)}</p>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => bookingBadge(row.original.status),
      },
      {
        id: 'payment',
        header: 'Payment',
        cell: ({ row }) => (
          <div className="space-y-1">
            {paymentBadge(row.original.paymentStatus)}
            <p className="text-xs text-slate-500">{methodText[row.original.paymentMethod]}</p>
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) =>
          row.original.status === 'pending' ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={update.isPending}
                onClick={() => update.mutate({ id: row.original.id, status: 'approved' })}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={update.isPending}
                className="border-rose-200 text-rose-700"
                onClick={() => update.mutate({ id: row.original.id, status: 'rejected' })}
              >
                Reject
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setSelected(row.original)}>
              View
            </Button>
          ),
      },
    ],
    [update],
  );
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });
  const allBookings = bookingsQuery.data ?? [];
  const stats = [
    ['Total reservations', allBookings.length, CalendarDays, 'bg-blue-50 text-blue-700'],
    [
      'Pending approval',
      allBookings.filter((item) => item.status === 'pending').length,
      Clock3,
      'bg-amber-50 text-amber-700',
    ],
    [
      'Approved',
      allBookings.filter((item) => item.status === 'approved').length,
      Check,
      'bg-emerald-50 text-emerald-700',
    ],
    [
      'Payments complete',
      allBookings.filter((item) => item.paymentStatus === PAYMENT_STATUSES.PAID).length,
      CircleDollarSign,
      'bg-violet-50 text-violet-700',
    ],
  ] as const;
  if (bookingsQuery.isLoading || billboardsQuery.isLoading) return <Loading />;
  if (bookingsQuery.isError || billboardsQuery.isError)
    return (
      <Failure
        message={
          (bookingsQuery.error ?? billboardsQuery.error)?.message ?? 'Unable to load reservations.'
        }
        retry={() => {
          void bookingsQuery.refetch();
          void billboardsQuery.refetch();
        }}
      />
    );
  return (
    <section className="min-h-[calc(100vh-var(--header-height))] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#ffffff_52%)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
              Operations
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Reservations & clients
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Review requests, advertiser details, payment progress, and approval queues.
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <ArrowDownToLine className="size-4" />
            Export view
          </Button>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(([label, value, Icon, color], index) => (
            <motion.div
              key={label}
              initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-white/80 bg-white/85 shadow-sm shadow-slate-200/60">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription>{label}</CardDescription>
                  <div className={cn('flex size-10 items-center justify-center rounded-xl', color)}>
                    <Icon className="size-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-slate-950">{value}</p>
                  <p className="mt-1 text-xs text-slate-500">Live operational total</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        {notice && (
          <div className="flex justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)}>
              <X className="size-4" />
            </button>
          </div>
        )}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
          <Card className="border-white/80 bg-white/90 shadow-xl shadow-slate-200/40">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Reservations</CardTitle>
                  <CardDescription>
                    {rows.length} reservation{rows.length === 1 ? '' : 's'} shown
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[ALL, 'pending', 'approved', 'completed', 'rejected'].map((item) => (
                    <Button
                      key={item}
                      size="sm"
                      variant={status === item ? 'default' : 'outline'}
                      onClick={() => setStatus(item as BookingStatus | typeof ALL)}
                    >
                      {item === ALL ? 'All' : statusText[item as BookingStatus]}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem]">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="pl-9"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search advertiser, email, reference..."
                  />
                </div>
                <Select value={billboardId} onValueChange={(value) => setBillboardId(value ?? ALL)}>
                  <SelectTrigger>
                    <MapPin className="size-4 text-slate-500" />
                    <SelectValue placeholder="All billboards" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All billboards</SelectItem>
                    {billboards.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((group) => (
                    <TableRow key={group.id}>
                      {group.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={selected?.id === row.original.id ? 'selected' : undefined}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-32 text-center text-slate-500"
                      >
                        No reservations match the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Details
            booking={selected}
            close={() => setSelected(null)}
            update={(next) => selected && update.mutate({ id: selected.id, status: next })}
            pending={update.isPending || reconcilePayment.isPending || refundPayment.isPending}
            recordPayment={(input) =>
              selected &&
              reconcilePayment.mutate({
                id: selected.id,
                ...input,
              })
            }
            refund={() => {
              if (
                selected &&
                window.confirm(
                  `Refund the full payment for ${selected.reference} and cancel the reservation?`,
                )
              ) {
                refundPayment.mutate(selected.id);
              }
            }}
          />
        </div>
      </div>
    </section>
  );
}
function Details({
  booking,
  close,
  update,
  pending,
  recordPayment,
  refund,
}: {
  booking: Row | null;
  close: () => void;
  update: (status: 'approved' | 'rejected') => void;
  pending: boolean;
  recordPayment: (input: {
    status: Extract<PaymentStatus, 'paid' | 'partially_paid' | 'unpaid' | 'refunded'>;
    amountPaid?: number;
    note?: string;
  }) => void;
  refund: () => void;
}) {
  const [manualStatus, setManualStatus] = useState<
    Extract<PaymentStatus, 'paid' | 'partially_paid' | 'unpaid' | 'refunded'>
  >(PAYMENT_STATUSES.PAID);
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  return (
    <Card className="h-fit border-white/80 bg-white/90 shadow-xl shadow-slate-200/40">
      <CardHeader>
        <div className="flex justify-between gap-3">
          <div>
            <CardTitle>Reservation details</CardTitle>
            <CardDescription>{booking?.reference ?? 'Select a reservation'}</CardDescription>
          </div>
          {booking && (
            <Button size="icon" variant="ghost" onClick={close}>
              <X className="size-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!booking ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 text-center text-sm text-slate-500">
            <Building2 className="mb-3 size-8 text-slate-300" />
            Select a row to inspect its advertiser, schedule, payment, and approval options.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">{booking.company.name}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                <Mail className="size-4" />
                {booking.billing.email}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {booking.billing.contactName} · {booking.billing.phone}
              </p>
            </div>
            <Field label="Campaign" value={booking.campaignName} />
            <Field
              label="Billboard"
              value={`${booking.billboard?.name ?? 'Unavailable'}${booking.billboard ? ` · ${booking.billboard.location.city}` : ''}`}
            />
            <Field
              label="Reservation"
              value={`${date(booking.startDate)} – ${date(booking.endDate)}`}
            />
            <Field
              label="Payment"
              value={`${paymentText[booking.paymentStatus]} · ${methodText[booking.paymentMethod]}`}
            />
            <Field label="Total" value={money(booking.pricing.total, booking.pricing.currency)} />
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-sm font-medium">Reservation status</span>
              {bookingBadge(booking.status)}
            </div>
            {booking.paymentMethod !== PAYMENT_METHODS.CARD ? (
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Record offline payment</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Use this after confirming the transfer, wallet receipt, or cash payment.
                  </p>
                </div>
                <Select
                  value={manualStatus}
                  onValueChange={(value) =>
                    setManualStatus(
                      (value ?? PAYMENT_STATUSES.PAID) as Extract<
                        PaymentStatus,
                        'paid' | 'partially_paid' | 'unpaid' | 'refunded'
                      >,
                    )
                  }
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PAYMENT_STATUSES.PAID}>Paid in full</SelectItem>
                    <SelectItem value={PAYMENT_STATUSES.PARTIALLY_PAID}>Partially paid</SelectItem>
                    <SelectItem value={PAYMENT_STATUSES.UNPAID}>Unpaid</SelectItem>
                    <SelectItem value={PAYMENT_STATUSES.REFUNDED}>Refunded</SelectItem>
                  </SelectContent>
                </Select>
                {manualStatus === PAYMENT_STATUSES.PARTIALLY_PAID ? (
                  <Input
                    type="number"
                    min="0.01"
                    max={booking.pricing.total}
                    step="0.01"
                    value={amountPaid}
                    onChange={(event) => setAmountPaid(event.target.value)}
                    placeholder={`Amount received (${booking.pricing.currency})`}
                    className="bg-white"
                  />
                ) : null}
                <Input
                  value={paymentNote}
                  onChange={(event) => setPaymentNote(event.target.value)}
                  maxLength={500}
                  placeholder="Receipt or reconciliation note (optional)"
                  className="bg-white"
                />
                <Button
                  className="w-full"
                  disabled={
                    pending ||
                    (manualStatus === PAYMENT_STATUSES.PARTIALLY_PAID &&
                      (!amountPaid || Number(amountPaid) <= 0))
                  }
                  onClick={() =>
                    recordPayment({
                      status: manualStatus,
                      amountPaid:
                        manualStatus === PAYMENT_STATUSES.PARTIALLY_PAID
                          ? Number(amountPaid)
                          : undefined,
                      note: paymentNote.trim() || undefined,
                    })
                  }
                >
                  Record payment status
                </Button>
              </div>
            ) : null}
            {booking.paymentMethod === PAYMENT_METHODS.CARD &&
            booking.paymentStatus === PAYMENT_STATUSES.PAID ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-semibold text-rose-950">Refund card payment</p>
                <p className="mt-1 text-xs leading-5 text-rose-700">
                  This issues a full Stripe refund and cancels the reservation so its dates are
                  released.
                </p>
                <Button
                  variant="outline"
                  className="mt-3 w-full border-rose-200 bg-white text-rose-700 hover:bg-rose-100"
                  disabled={pending}
                  onClick={refund}
                >
                  <RefreshCcw className="size-4" />
                  Refund and cancel
                </Button>
              </div>
            ) : null}
            {booking.status === 'pending' && (
              <div className="grid gap-2">
                <Button disabled={pending} onClick={() => update('approved')}>
                  <Check className="size-4" />
                  Approve reservation
                </Button>
                <Button
                  disabled={pending}
                  variant="outline"
                  className="border-rose-200 text-rose-700"
                  onClick={() => update('rejected')}
                >
                  Reject reservation
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}
function Loading() {
  return (
    <section className="min-h-[calc(100vh-var(--header-height))] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton className="h-24" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[32rem]" />
      </div>
    </section>
  );
}
function Failure({ message, retry }: { message: string; retry: () => void }) {
  return (
    <section className="min-h-[calc(100vh-var(--header-height))] p-6">
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>Reservations are unavailable</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={retry}>Try again</Button>
        </CardContent>
      </Card>
    </section>
  );
}
