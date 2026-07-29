'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  CreditCard,
  Loader2,
  LockKeyhole,
  RotateCcw,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { paymentClientService } from '@/client/features/payments/services/payment-client.service';
import { BrandLogo } from '@/client/features/home/components/brand-logo';
import { Card, CardContent } from '@/client/ui/components/ui/card';
import { PAYMENT_STATUSES } from '@/shared/constants/payment';
import type { CheckoutVerification } from '@/shared/types/payment';

type VerificationState = 'checking' | 'paid' | 'pending' | 'error';

function money(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

export function PaymentSuccessView({ sessionId }: { sessionId?: string }) {
  const reduceMotion = useReducedMotion();
  const [state, setState] = useState<VerificationState>('checking');
  const [verification, setVerification] = useState<CheckoutVerification | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const verify = async () => {
      if (!sessionId) {
        setState('error');
        setMessage(
          'The Stripe Checkout reference is missing. Open My bookings to check the payment.',
        );
        return;
      }

      setState('checking');
      setMessage(null);
      const result = await paymentClientService.verifyCheckoutSession(sessionId);
      if (cancelled) return;

      if (!result.ok || !result.data) {
        setState('error');
        setMessage(
          result.error ??
            'We could not verify this payment yet. Check My bookings before trying to pay again.',
        );
        return;
      }

      setVerification(result.data);
      if (result.data.payment.status === PAYMENT_STATUSES.PAID) {
        setState('paid');
        return;
      }

      if (
        result.data.payment.status === PAYMENT_STATUSES.PENDING ||
        result.data.payment.status === PAYMENT_STATUSES.REFUND_PENDING
      ) {
        setState('pending');
        setMessage(
          result.data.payment.status === PAYMENT_STATUSES.REFUND_PENDING
            ? 'A refund is currently processing for this payment.'
            : 'Stripe is still confirming the payment. Your reservation will update automatically.',
        );
        if (retryKey < 4) {
          retryTimer = setTimeout(() => setRetryKey((value) => value + 1), 2_000);
        }
        return;
      }

      setState('error');
      setMessage(
        result.data.payment.status === PAYMENT_STATUSES.REFUNDED
          ? 'This payment was refunded. Open My bookings for the current reservation status.'
          : 'Stripe did not confirm a completed payment. No second charge should be attempted until you review My bookings.',
      );
    };

    void verify();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [retryKey, sessionId]);

  const paid = state === 'paid';
  const pending = state === 'pending';

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f5f8fc] px-4 py-8 sm:px-6 sm:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,.14),transparent_36%)]"
      />
      <div className="relative mx-auto w-full max-w-2xl">
        <div className="mb-8 flex justify-center">
          <BrandLogo />
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="overflow-hidden rounded-[1.75rem] border-white bg-white shadow-[0_28px_90px_rgba(15,23,42,.1)]">
            <CardContent className="p-0">
              <div className="flex flex-col items-center px-6 pt-10 pb-8 text-center sm:px-10 sm:pt-12">
                <motion.span
                  initial={reduceMotion ? false : { scale: 0.65, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.08 }}
                  className={`flex size-16 items-center justify-center rounded-2xl ${
                    paid
                      ? 'bg-emerald-100 text-emerald-700'
                      : pending
                        ? 'bg-amber-100 text-amber-700'
                        : state === 'error'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {state === 'checking' ? (
                    <Loader2 className="size-8 animate-spin" aria-hidden />
                  ) : paid ? (
                    <CheckCircle2 className="size-8" aria-hidden />
                  ) : pending ? (
                    <Clock3 className="size-8" aria-hidden />
                  ) : (
                    <CircleAlert className="size-8" aria-hidden />
                  )}
                </motion.span>

                <p className="mt-6 text-xs font-semibold tracking-[0.14em] text-blue-700 uppercase">
                  Secure card payment
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                  {state === 'checking'
                    ? 'Verifying your payment'
                    : paid
                      ? 'Payment complete'
                      : pending
                        ? 'Payment is processing'
                        : 'Payment needs attention'}
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-600 sm:text-base">
                  {paid
                    ? 'Stripe confirmed the charge and your reservation payment is recorded.'
                    : (message ??
                      'We are securely checking the Stripe transaction against your reservation.')}
                </p>
              </div>

              {verification ? (
                <div className="border-y border-zinc-100 bg-zinc-50/80 px-6 py-5 sm:px-10">
                  <dl className="grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-zinc-500">Reservation</dt>
                      <dd className="mt-1 font-semibold text-zinc-950">
                        {verification.booking.reference}
                      </dd>
                    </div>
                    <div className="sm:text-right">
                      <dt className="text-xs text-zinc-500">Amount</dt>
                      <dd className="mt-1 text-lg font-semibold text-zinc-950 tabular-nums">
                        {money(
                          verification.payment.amountPaid || verification.payment.amount,
                          verification.payment.currency,
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-zinc-500">Campaign</dt>
                      <dd className="mt-1 font-medium text-zinc-800">
                        {verification.booking.campaignName}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : null}

              <div className="px-6 py-6 sm:px-10 sm:py-8">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/user/advertiser/bookings"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    View my bookings
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  {state === 'error' || pending ? (
                    <button
                      type="button"
                      onClick={() => setRetryKey((value) => value + 1)}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
                    >
                      <RotateCcw className="size-4" aria-hidden />
                      Check again
                    </button>
                  ) : (
                    <Link
                      href="/billboards"
                      className="inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
                    >
                      Browse billboards
                    </Link>
                  )}
                </div>
                <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-zinc-500">
                  <LockKeyhole className="size-3.5" aria-hidden />
                  Card details are handled by Stripe and never stored by Boardly.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}

export function PaymentCancelledView({ bookingId }: { bookingId?: string }) {
  const reduceMotion = useReducedMotion();
  const bookingsHref = bookingId
    ? `/user/advertiser/bookings?payment=${encodeURIComponent(bookingId)}`
    : '/user/advertiser/bookings';

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f5f8fc] px-4 py-8 sm:px-6 sm:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,.12),transparent_36%)]"
      />
      <div className="relative mx-auto w-full max-w-2xl">
        <div className="mb-8 flex justify-center">
          <BrandLogo />
        </div>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="rounded-[1.75rem] border-white bg-white shadow-[0_28px_90px_rgba(15,23,42,.1)]">
            <CardContent className="flex flex-col items-center p-7 text-center sm:p-12">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
                <CreditCard className="size-8" aria-hidden />
              </span>
              <p className="mt-6 text-xs font-semibold tracking-[0.14em] text-blue-700 uppercase">
                Checkout closed
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                No charge was made
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-600 sm:text-base">
                Your approved reservation is still available. Return to My bookings whenever you are
                ready to restart secure card checkout.
              </p>
              <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                <Link
                  href={bookingsHref}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Return to my bookings
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href="/billboards"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-200 px-5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
                >
                  Browse billboards
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
