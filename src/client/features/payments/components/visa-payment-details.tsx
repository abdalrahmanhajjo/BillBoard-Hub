'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import type {
  StripeCardCvcElementChangeEvent,
  StripeCardExpiryElementChangeEvent,
  StripeCardNumberElementChangeEvent,
} from '@stripe/stripe-js';
import { Check, CreditCard, LockKeyhole } from 'lucide-react';
import { paymentClientService } from '@/client/features/payments/services/payment-client.service';

export type ConfirmVisaSetup = () => Promise<string | null>;

type VisaPaymentDetailsProps = {
  billingName: string;
  billingEmail: string;
  onConfirmReady: (confirm: ConfirmVisaSetup | null) => void;
  onReadyChange: (ready: boolean) => void;
};

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const stripeElementOptions = {
  style: {
    base: {
      color: '#18181b',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      fontSize: '15px',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#a1a1aa' },
    },
    invalid: { color: '#dc2626' },
  },
} as const;

export function VisaPaymentDetails({
  billingName,
  billingEmail,
  onConfirmReady,
  onReadyChange,
}: VisaPaymentDetailsProps) {
  const [setup, setSetup] = useState<{ clientSecret: string; setupIntentId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const setupRequestRef = useRef<ReturnType<typeof paymentClientService.createCardSetup> | null>(
    null,
  );

  useEffect(() => {
    let active = true;

    async function loadCardSetup() {
      if (!stripePromise) {
        setLoadError(
          'Visa payment is not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and restart the app.',
        );
        setLoading(false);
        return;
      }

      setupRequestRef.current ??= paymentClientService.createCardSetup();
      const result = await setupRequestRef.current;
      if (!active) return;

      if (!result.ok || !result.data) {
        setLoadError(
          result.error ?? 'We could not open secure Visa details. Refresh and try again.',
        );
      } else {
        setSetup(result.data);
      }
      setLoading(false);
    }

    void loadCardSetup();
    return () => {
      active = false;
      onConfirmReady(null);
      onReadyChange(false);
    };
  }, [onConfirmReady, onReadyChange]);

  if (loading) {
    return (
      <div
        className="animate-pulse rounded-2xl bg-zinc-100 p-5"
        aria-label="Opening secure Visa details"
      >
        <div className="h-4 w-32 rounded bg-zinc-200" />
        <div className="mt-7 h-12 rounded-xl bg-white" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="h-12 rounded-xl bg-white" />
          <div className="h-12 rounded-xl bg-white" />
        </div>
      </div>
    );
  }

  if (loadError || !setup || !stripePromise) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {loadError ?? 'Secure Visa details are unavailable. Refresh and try again.'}
      </p>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <VisaSetupFields
        billingName={billingName}
        billingEmail={billingEmail}
        onConfirmReady={onConfirmReady}
        onReadyChange={onReadyChange}
        setupIntentId={setup.setupIntentId}
        clientSecret={setup.clientSecret}
      />
    </Elements>
  );
}

function VisaSetupFields({
  billingName,
  billingEmail,
  setupIntentId,
  clientSecret,
  onConfirmReady,
  onReadyChange,
}: VisaPaymentDetailsProps & { setupIntentId: string; clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [numberComplete, setNumberComplete] = useState(false);
  const [expiryComplete, setExpiryComplete] = useState(false);
  const [cvcComplete, setCvcComplete] = useState(false);
  const [brand, setBrand] = useState('unknown');
  const [processing, setProcessing] = useState(false);
  const [verifiedIntentId, setVerifiedIntentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const complete =
    Boolean(stripe && elements) &&
    numberComplete &&
    expiryComplete &&
    cvcComplete &&
    brand === 'visa';

  const confirm = useCallback<ConfirmVisaSetup>(async () => {
    if (verifiedIntentId) return verifiedIntentId;
    if (!stripe || !elements) {
      setError('Stripe is still loading. Wait a moment and try again.');
      return null;
    }
    if (brand !== 'visa') {
      setError('Only Visa cards are accepted for online payment.');
      return null;
    }
    if (!numberComplete || !expiryComplete || !cvcComplete) {
      setError('Complete the Visa number, expiry date, and security code.');
      return null;
    }

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      setError('Secure Visa fields did not load. Refresh and try again.');
      return null;
    }

    setProcessing(true);
    setError(null);
    const result = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: cardNumber,
        billing_details: {
          name: billingName,
          email: billingEmail,
        },
      },
    });
    setProcessing(false);

    if (result.error) {
      setError(result.error.message ?? 'Stripe could not verify this Visa. Check the details.');
      return null;
    }
    if (result.setupIntent?.status !== 'succeeded') {
      setError('Stripe did not complete Visa verification. Try again.');
      return null;
    }

    setVerifiedIntentId(setupIntentId);
    return setupIntentId;
  }, [
    billingEmail,
    billingName,
    brand,
    clientSecret,
    cvcComplete,
    elements,
    expiryComplete,
    numberComplete,
    setupIntentId,
    stripe,
    verifiedIntentId,
  ]);

  useEffect(() => {
    onConfirmReady(confirm);
    return () => onConfirmReady(null);
  }, [confirm, onConfirmReady]);

  useEffect(() => {
    onReadyChange(complete || Boolean(verifiedIntentId));
  }, [complete, onReadyChange, verifiedIntentId]);

  const cardStatus = useMemo(() => {
    if (verifiedIntentId) return 'Visa verified with Stripe';
    if (processing) return 'Verifying securely…';
    if (brand !== 'unknown' && brand !== 'visa') return 'Visa cards only';
    return 'Secure Visa';
  }, [brand, processing, verifiedIntentId]);

  return (
    <div className="overflow-hidden rounded-2xl bg-[#112a67] text-white shadow-[0_24px_60px_rgba(17,42,103,0.2)]">
      <div className="relative p-5 sm:p-6">
        <div
          className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full border border-white/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-4 -bottom-24 size-44 rounded-full bg-blue-400/20 blur-2xl"
          aria-hidden
        />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-9 items-center justify-center rounded-lg bg-white/10">
              {verifiedIntentId ? (
                <Check className="size-4" aria-hidden />
              ) : (
                <CreditCard className="size-4" aria-hidden />
              )}
            </span>
            {cardStatus}
          </div>
          <span className="text-xl font-black tracking-tight italic">VISA</span>
        </div>

        <div
          className={`relative mt-7 ${verifiedIntentId ? 'pointer-events-none opacity-80' : ''}`}
          aria-disabled={verifiedIntentId ? true : undefined}
        >
          <StripeField label="Card number">
            <CardNumberElement
              options={{ ...stripeElementOptions, showIcon: true }}
              onChange={(event: StripeCardNumberElementChangeEvent) => {
                setNumberComplete(event.complete);
                setBrand(event.brand);
                setError(event.error?.message ?? null);
                setVerifiedIntentId(null);
              }}
            />
          </StripeField>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <StripeField label="Expiry">
              <CardExpiryElement
                options={stripeElementOptions}
                onChange={(event: StripeCardExpiryElementChangeEvent) => {
                  setExpiryComplete(event.complete);
                  setError(event.error?.message ?? null);
                  setVerifiedIntentId(null);
                }}
              />
            </StripeField>
            <StripeField label="CVC">
              <CardCvcElement
                options={stripeElementOptions}
                onChange={(event: StripeCardCvcElementChangeEvent) => {
                  setCvcComplete(event.complete);
                  setError(event.error?.message ?? null);
                  setVerifiedIntentId(null);
                }}
              />
            </StripeField>
          </div>
        </div>

        <div className="relative mt-5 flex items-center gap-2 text-xs text-blue-100">
          <LockKeyhole className="size-3.5 shrink-0" aria-hidden />
          Stripe encrypts these details. Boardly never receives or stores the card number.
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/10 px-5 py-3 text-[11px] leading-5 text-blue-100 sm:px-6">
        By submitting, you authorize Boardly to save this Visa with Stripe and make it available for
        secure payment only after your reservation dates are approved.
      </div>

      {error ? (
        <p
          role="alert"
          className="border-t border-red-300/20 bg-red-950/40 px-5 py-3 text-xs text-red-100 sm:px-6"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function StripeField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block rounded-xl border border-white/15 bg-white p-3 text-zinc-900 shadow-sm">
      <span className="mb-2 block text-[10px] font-semibold tracking-[0.12em] text-zinc-500 uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
