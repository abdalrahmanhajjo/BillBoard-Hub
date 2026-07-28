'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useForm, useWatch, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileCheck2,
  Info,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Monitor,
  Phone,
  ShieldCheck,
  UploadCloud,
  Wallet,
} from 'lucide-react';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import {
  BOOKING_CREATIVE_TYPES,
  BOOKING_CURRENCIES,
  CAMPAIGN_OBJECTIVES,
  DIGITAL_RESERVATION_DAILY_LIMIT,
  PAYMENT_METHODS,
} from '@/shared/constants/booking';
import { MAX_CREATIVE_VIDEO_DURATION_SECONDS } from '@/shared/constants/creative';
import { computeBookingPricing, inclusiveDays } from '@/shared/pricing/booking-pricing';
import type { PublicBillboard } from '@/shared/types/billboard';
import type {
  Booking,
  BookingCreativeType,
  BookingCurrency,
  CampaignObjective,
} from '@/shared/types/booking';
import {
  createBookingSchema,
  type CreateBookingSchemaInput,
} from '@/shared/contracts/booking/booking.schema';
import { uploadCreativeAsset } from '@/client/features/creatives/services/creative-upload.service';
import {
  isVideoDurationAllowed,
  readVideoDurationSeconds,
} from '@/client/features/creatives/utils/video-metadata';
import { bookingClientService } from '@/client/features/bookings/services/booking-client.service';
import { trackEvent } from '@/client/features/analytics/lib/track-event';
import { Card } from '@/client/ui/components/ui/card';
import {
  VisaPaymentDetails,
  type ConfirmVisaSetup,
} from '@/client/features/payments/components/visa-payment-details';

type Viewer = { fullName: string; email: string; role: string } | null;

type ReservationCheckoutPageProps = {
  billboard: PublicBillboard;
  viewer: Viewer;
  initialStart?: string;
  initialEnd?: string;
};

const STEPS = ['Booking Details', 'Review & Confirm', 'Payment & Invoice', 'Confirmation'];

const BOOKING_DETAILS_FIELDS: (keyof CreateBookingSchemaInput)[] = [
  'billboardId',
  'campaignName',
  'objective',
  'targetAudience',
  'brief',
  'notes',
  'startDate',
  'endDate',
  'creativeUrl',
  'creativeType',
  'creativeDurationSeconds',
  'billing',
  'company',
];

const OBJECTIVE_OPTIONS: { value: CampaignObjective; label: string }[] = [
  { value: CAMPAIGN_OBJECTIVES.AWARENESS, label: 'Drive brand awareness' },
  { value: CAMPAIGN_OBJECTIVES.PRODUCT_LAUNCH, label: 'Launch a product' },
  { value: CAMPAIGN_OBJECTIVES.STORE_VISITS, label: 'Drive store visits' },
  { value: CAMPAIGN_OBJECTIVES.ENGAGEMENT, label: 'Boost engagement' },
];

type ReservationPaymentMethod = typeof PAYMENT_METHODS.CARD | typeof PAYMENT_METHODS.E_WALLET;

const PAYMENT_OPTIONS: {
  value: ReservationPaymentMethod;
  label: string;
  hint: string;
  icon: typeof CreditCard;
}[] = [
  {
    value: PAYMENT_METHODS.CARD,
    label: 'Visa through Stripe',
    hint: 'Secure online payment',
    icon: CreditCard,
  },
  {
    value: PAYMENT_METHODS.E_WALLET,
    label: 'Cash / Whish',
    hint: 'Pay after date approval',
    icon: Wallet,
  },
];

const STATIC_CREATIVE_GUIDELINES = [
  'High resolution images',
  'No animated content',
  'Maintain safe area',
  'Text readability',
  'Avoid small fonts',
];

const DIGITAL_CREATIVE_GUIDELINES = [
  'High resolution images or video',
  `Videos shorter than ${MAX_CREATIVE_VIDEO_DURATION_SECONDS} seconds`,
  'MP4, WebM, or MOV video format',
  'Maintain safe area',
  'Use large, readable text',
];

const MAX_RESERVATION_CREATIVE_SIZE_MB = 100;
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const DOCUMENT_MIME_TYPES = ['application/pdf'];

const FAQ_ITEMS = [
  {
    q: 'Can I change my dates later?',
    a: 'Yes. Until a reservation is approved you can request different dates, subject to availability.',
  },
  {
    q: 'Can I cancel my reservation?',
    a: 'Pending and approved reservations can be cancelled from your reservations dashboard. Reach out to the team for anything else.',
  },
  {
    q: 'When will my ad go live?',
    a: 'Once the team confirms availability and receives your creative, your campaign starts on the requested date.',
  },
  {
    q: 'What file formats are accepted?',
    a: `JPG, PNG, WebP, or PDF files up to ${MAX_RESERVATION_CREATIVE_SIZE_MB}MB. Digital billboards also accept MP4, WebM, and MOV videos shorter than ${MAX_CREATIVE_VIDEO_DURATION_SECONDS} seconds.`,
  },
];

const inputClass =
  'w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const inputErrorClass =
  'w-full rounded-lg border border-red-400 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-100';
const labelClass = 'mb-1.5 block text-xs font-medium text-zinc-500';

function addDaysIso(iso: string, days: number): string {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function reservationCreativeType(file: File): BookingCreativeType | null {
  if (IMAGE_MIME_TYPES.includes(file.type)) return BOOKING_CREATIVE_TYPES.IMAGE;
  if (VIDEO_MIME_TYPES.includes(file.type)) return BOOKING_CREATIVE_TYPES.VIDEO;
  if (DOCUMENT_MIME_TYPES.includes(file.type)) return BOOKING_CREATIVE_TYPES.DOCUMENT;

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp'].includes(extension ?? '')) {
    return BOOKING_CREATIVE_TYPES.IMAGE;
  }
  if (['mp4', 'webm', 'mov'].includes(extension ?? '')) return BOOKING_CREATIVE_TYPES.VIDEO;
  if (extension === 'pdf') return BOOKING_CREATIVE_TYPES.DOCUMENT;
  return null;
}

export function ReservationCheckoutPage({
  billboard,
  viewer,
  initialStart,
  initialEnd,
}: ReservationCheckoutPageProps) {
  const today = new Date().toISOString().slice(0, 10);
  const defaultStart = initialStart ?? today;
  const defaultEnd = initialEnd ?? addDaysIso(defaultStart, 13);
  const isDigital = billboard.type === BILLBOARD_TYPES.DIGITAL;
  const isBookable = billboard.isAvailable;

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    trigger,
    formState: { errors, submitCount },
  } = useForm<CreateBookingSchemaInput>({
    resolver: zodResolver(createBookingSchema),
    mode: 'onTouched',
    defaultValues: {
      billboardId: billboard.id,
      campaignName: '',
      objective: CAMPAIGN_OBJECTIVES.AWARENESS,
      targetAudience: '',
      brief: '',
      notes: '',
      startDate: defaultStart,
      endDate: defaultEnd,
      creativeUrl: undefined,
      creativeType: undefined,
      creativeDurationSeconds: undefined,
      billing: {
        contactName: viewer?.fullName ?? '',
        email: viewer?.email ?? '',
        phone: '',
        vatNumber: '',
      },
      company: { name: '', commercialRegister: '', address: '', country: 'Lebanon' },
      paymentMethod: PAYMENT_METHODS.CARD,
      stripeSetupIntentId: undefined,
      invoice: { currency: 'USD', email: viewer?.email ?? '', poNumber: '' },
      termsAccepted: false,
    },
  });

  // Watched values that drive the live quote, review, and character counters.
  const startDate = useWatch({ control, name: 'startDate' }) ?? defaultStart;
  const endDate = useWatch({ control, name: 'endDate' }) ?? defaultEnd;
  const currency = (useWatch({ control, name: 'invoice.currency' }) ?? 'USD') as BookingCurrency;
  const paymentMethod = useWatch({ control, name: 'paymentMethod' }) ?? PAYMENT_METHODS.CARD;
  const billingName = useWatch({ control, name: 'billing.contactName' }) ?? '';
  const billingEmail = useWatch({ control, name: 'billing.email' }) ?? '';
  const campaignName = useWatch({ control, name: 'campaignName' }) ?? '';
  const targetAudienceValue = useWatch({ control, name: 'targetAudience' }) ?? '';
  const briefValue = useWatch({ control, name: 'brief' }) ?? '';
  const notesValue = useWatch({ control, name: 'notes' }) ?? '';

  const [creative, setCreative] = useState<{
    name: string;
    size: number;
    url: string;
    type: BookingCreativeType;
    durationSeconds?: number;
  } | null>(null);
  const [uploadingCreative, setUploadingCreative] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [visaReady, setVisaReady] = useState(false);
  const visaConfirmRef = useRef<ConfirmVisaSetup | null>(null);

  const days = inclusiveDays(startDate, endDate);
  const pricing = computeBookingPricing(billboard.monthlyPrice, Math.max(days, 0));
  const money = useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency }),
    [currency],
  );
  const dailyImpressions = billboard.trafficCount;
  const estImpressions = dailyImpressions ? dailyImpressions * Math.max(days, 0) : undefined;
  const activeStep = step;
  const hasErrors = Object.keys(errors).length > 0;
  const creativeGuidelines = isDigital ? DIGITAL_CREATIVE_GUIDELINES : STATIC_CREATIVE_GUIDELINES;
  const paymentLabel =
    PAYMENT_OPTIONS.find((option) => option.value === paymentMethod)?.label ?? 'Payment method';
  const isCardPayment = paymentMethod === PAYMENT_METHODS.CARD;
  const setVisaConfirm = useCallback((confirm: ConfirmVisaSetup | null) => {
    visaConfirmRef.current = confirm;
  }, []);
  const setVisaDetailsReady = useCallback((ready: boolean) => {
    setVisaReady(ready);
  }, []);

  const onCreativeSelected = async (file: File | null) => {
    if (!file) return;
    setUploadError(null);

    const fileType = reservationCreativeType(file);
    if (!fileType) {
      setUploadError('Choose a JPG, PNG, WebP, PDF, MP4, WebM, or MOV file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (fileType === BOOKING_CREATIVE_TYPES.VIDEO && !isDigital) {
      setUploadError('Video creatives are only available for digital billboards.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > MAX_RESERVATION_CREATIVE_SIZE_MB * 1024 * 1024) {
      setUploadError(`File must be under ${MAX_RESERVATION_CREATIVE_SIZE_MB}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingCreative(true);
    try {
      const durationSeconds =
        fileType === BOOKING_CREATIVE_TYPES.VIDEO
          ? await readVideoDurationSeconds(file)
          : undefined;
      if (durationSeconds !== undefined && !isVideoDurationAllowed(durationSeconds)) {
        setUploadError(
          `Video must be shorter than ${MAX_CREATIVE_VIDEO_DURATION_SECONDS} seconds. This file is ${durationSeconds.toFixed(1)} seconds.`,
        );
        return;
      }

      const url = await uploadCreativeAsset(file);
      setCreative({ name: file.name, size: file.size, url, type: fileType, durationSeconds });
      setValue('creativeUrl', url, { shouldValidate: true });
      setValue('creativeType', fileType, { shouldValidate: true });
      setValue('creativeDurationSeconds', durationSeconds, { shouldValidate: true });
    } catch (uploadErr) {
      setUploadError(
        uploadErr instanceof Error
          ? uploadErr.message
          : 'We could not upload this creative. Check the file and try again.',
      );
    } finally {
      setUploadingCreative(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const scrollTop = () => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onInvalid = () => {
    if (typeof window !== 'undefined') {
      document
        .querySelector('[aria-invalid="true"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Step 1 → 2 validates booking details only. Payment and invoice fields are
  // intentionally deferred until Step 3.
  const startReview = async () => {
    setServerError(null);
    if (!viewer) {
      window.location.href = `/login?callbackUrl=/billboards/${billboard.id}/reservation`;
      return;
    }
    if (!isBookable) {
      setServerError('This billboard is not currently available for booking.');
      scrollTop();
      return;
    }
    const valid = await trigger(BOOKING_DETAILS_FIELDS, { shouldFocus: true });
    if (!valid) {
      onInvalid();
      return;
    }
    setStep(2);
    scrollTop();
  };

  const continueToPayment = () => {
    setServerError(null);
    setStep(3);
    scrollTop();
  };

  // Step 3 → 4 validates the complete payload, creates the pending
  // reservation, and then shows confirmation.
  const confirmReservation = handleSubmit(async () => {
    setServerError(null);
    setStatus('submitting');
    const result = await bookingClientService.create(getValues());
    if (!result.ok) {
      setServerError(
        result.error ?? 'We could not submit your reservation. Review the details and try again.',
      );
      setStatus('idle');
      scrollTop();
      return;
    }
    const createdBooking = (result.data as Booking | undefined) ?? null;
    if (!createdBooking) {
      setServerError(
        'Your reservation response was incomplete. Check My bookings before trying again.',
      );
      setStatus('idle');
      scrollTop();
      return;
    }
    setBooking(createdBooking);
    setStatus('idle');
    setStep(4);
    trackEvent('reservation_submitted', {
      booking_reference: createdBooking.reference,
      billboard_id: billboard.id,
      billboard_city: billboard.location.city,
      billboard_type: billboard.type,
      value: createdBooking.pricing.total,
      currency: createdBooking.pricing.currency,
    });
    scrollTop();
  }, onInvalid);

  const securePaymentAndSubmit = async () => {
    setServerError(null);

    if (isCardPayment) {
      if (!visaConfirmRef.current) {
        setServerError('Secure Visa details are still loading. Wait a moment and try again.');
        return;
      }

      setStatus('submitting');
      const setupIntentId = await visaConfirmRef.current();
      if (!setupIntentId) {
        setStatus('idle');
        return;
      }
      setValue('stripeSetupIntentId', setupIntentId, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else {
      setValue('stripeSetupIntentId', undefined, { shouldValidate: true });
    }

    await confirmReservation();
  };

  const sidebarPrimary = () => {
    if (step === 1) return void startReview();
    if (step === 2) return continueToPayment();
    if (step === 3) return void securePaymentAndSubmit();
  };
  const sidebarLabel =
    step === 1
      ? 'Continue to review'
      : step === 2
        ? 'Continue to payment'
        : status === 'submitting'
          ? isCardPayment
            ? 'Securing Visa…'
            : 'Submitting…'
          : isCardPayment
            ? 'Secure Visa & submit'
            : 'Submit reservation';

  return (
    <div className="min-h-full text-zinc-950">
      <div className="mx-auto w-full max-w-295 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
          <Link href="/" className="hover:text-zinc-800">
            Home
          </Link>
          <span aria-hidden>›</span>
          <Link href="/billboards" className="hover:text-zinc-800">
            Billboards
          </Link>
          <span aria-hidden>›</span>
          <Link href={`/billboards/${billboard.id}`} className="hover:text-zinc-800">
            {billboard.name}
          </Link>
          <span aria-hidden>›</span>
          <span className="font-medium text-zinc-800">Checkout</span>
        </nav>

        <Stepper
          activeStep={activeStep}
          onStepSelect={(targetStep) => {
            if (step === 4 || targetStep >= step) return;
            setServerError(null);
            setStep(targetStep);
            scrollTop();
          }}
        />

        {step === 4 && booking ? (
          <ConfirmationPanel booking={booking} billboard={billboard} money={money} />
        ) : (
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              {step === 1 ? (
                <>
                  {!viewer ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                      <span>Sign in to an advertiser account to submit this reservation.</span>
                      <Link
                        href={`/login?callbackUrl=/billboards/${billboard.id}/reservation`}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        Login to continue
                      </Link>
                    </div>
                  ) : null}

                  {!isBookable ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      <span>
                        This billboard is not currently available for booking. Please browse other
                        available billboards.
                      </span>
                      <Link
                        href="/billboards"
                        className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                      >
                        Browse billboards
                      </Link>
                    </div>
                  ) : null}

                  {/* 1. Selected Billboard */}
                  <Section number={1} title="Selected Billboard">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="h-28 w-full overflow-hidden rounded-lg bg-zinc-100 sm:w-44">
                        {billboard.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={billboard.images[0]}
                            alt={billboard.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-zinc-400">
                            <Monitor className="size-6" aria-hidden />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{billboard.name}</h3>
                          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            {isDigital ? 'Digital Billboard' : 'Static Billboard'}
                          </span>
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
                          <MapPin className="size-3.5 text-blue-600" aria-hidden />
                          {billboard.location.address}, {billboard.location.city}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Tag>{isDigital ? 'Digital' : 'Static'}</Tag>
                          <Tag>
                            {billboard.dimensions.width}m × {billboard.dimensions.height}m
                          </Tag>
                          <Tag>High Visibility</Tag>
                          <Link
                            href={`/billboards/${billboard.id}`}
                            className="text-xs font-medium text-blue-600 hover:underline"
                          >
                            View details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Section>

                  {/* 2. Campaign Dates */}
                  <Section number={2} title="Campaign Duration">
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_1fr] sm:items-end">
                      <div>
                        <label className={labelClass} htmlFor="start-date">
                          Start Date
                        </label>
                        <input
                          id="start-date"
                          type="date"
                          min={today}
                          aria-invalid={errors.startDate ? true : undefined}
                          className={errors.startDate ? inputErrorClass : inputClass}
                          {...register('startDate', {
                            onChange: (event) => {
                              if ((getValues('endDate') ?? '') < event.target.value) {
                                setValue('endDate', event.target.value, { shouldValidate: true });
                              }
                            },
                          })}
                        />
                        <FieldError message={errors.startDate?.message} />
                      </div>
                      <div className="hidden items-center justify-center pb-2.5 text-zinc-400 sm:flex">
                        <ArrowRight className="size-4" aria-hidden />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="end-date">
                          End Date
                        </label>
                        <input
                          id="end-date"
                          type="date"
                          min={startDate}
                          aria-invalid={errors.endDate ? true : undefined}
                          className={errors.endDate ? inputErrorClass : inputClass}
                          {...register('endDate')}
                        />
                        <FieldError message={errors.endDate?.message} />
                      </div>
                      <div>
                        <label className={labelClass}>Duration</label>
                        <div className="rounded-lg bg-zinc-100 px-3 py-2.5 text-sm font-semibold text-zinc-700">
                          {days > 0 ? `${days} Days` : '—'}
                        </div>
                      </div>
                    </div>
                    {isDigital ? (
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
                        <Info className="size-3.5 shrink-0 text-blue-500" aria-hidden />
                        This is a digital screen — it rotates up to{' '}
                        {DIGITAL_RESERVATION_DAILY_LIMIT} ads, so your dates only clash when it is
                        fully booked.
                      </p>
                    ) : null}
                  </Section>

                  {/* 3. Campaign Brief */}
                  <Section number={3} title="Campaign Brief" subtitle="Tell us about your campaign">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="campaign-name">
                          Campaign Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="campaign-name"
                          maxLength={120}
                          placeholder="Summer Collection Launch"
                          aria-invalid={errors.campaignName ? true : undefined}
                          className={errors.campaignName ? inputErrorClass : inputClass}
                          {...register('campaignName')}
                        />
                        <FieldError message={errors.campaignName?.message} />
                        <label className={`${labelClass} mt-4`} htmlFor="objective">
                          Objective
                        </label>
                        <select id="objective" className={inputClass} {...register('objective')}>
                          {OBJECTIVE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <label className={`${labelClass} mt-4`} htmlFor="audience">
                          Target Audience (Optional)
                        </label>
                        <textarea
                          id="audience"
                          maxLength={500}
                          rows={2}
                          placeholder="18–45, Urban professionals, Beirut & Mount Lebanon"
                          className={`${inputClass} resize-none`}
                          {...register('targetAudience')}
                        />
                        <p className="mt-1 text-right text-[11px] text-zinc-400">
                          {targetAudienceValue.length}/500
                        </p>
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="brief">
                          Campaign Brief
                        </label>
                        <textarea
                          id="brief"
                          maxLength={1000}
                          rows={8}
                          placeholder="What are you launching? Share the message, tone, and any local context."
                          className={`${inputClass} h-[calc(100%-2rem)] resize-none`}
                          {...register('brief')}
                        />
                        <p className="mt-1 text-right text-[11px] text-zinc-400">
                          {briefValue.length}/1000
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className={labelClass} htmlFor="notes">
                        Notes (Optional)
                      </label>
                      <textarea
                        id="notes"
                        maxLength={1000}
                        rows={3}
                        placeholder="Anything else the team should know — special requests, timing, constraints."
                        className={`${inputClass} resize-none`}
                        {...register('notes')}
                      />
                      <p className="mt-1 text-right text-[11px] text-zinc-400">
                        {notesValue.length}/1000
                      </p>
                    </div>
                  </Section>

                  {/* 4. Creative Upload */}
                  <Section
                    number={4}
                    title="Creative Upload"
                    subtitle="Upload your billboard creative or provide a link"
                  >
                    <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
                      <div>
                        <button
                          type="button"
                          disabled={uploadingCreative}
                          onClick={() => fileInputRef.current?.click()}
                          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/60 px-4 py-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/40 disabled:cursor-wait disabled:opacity-70"
                        >
                          <UploadCloud className="size-7 text-zinc-400" aria-hidden />
                          <span className="text-sm font-medium text-zinc-700">
                            {uploadingCreative
                              ? 'Checking and uploading…'
                              : creative
                                ? creative.name
                                : 'Choose your campaign creative'}
                          </span>
                          <span className="text-xs text-zinc-400">
                            The file is checked before it uploads
                          </span>
                          <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700">
                            Choose File
                          </span>
                          <span className="mt-2 text-[11px] text-zinc-400">
                            {isDigital
                              ? `JPG, PNG, WebP, PDF, MP4, WebM or MOV · Max ${MAX_RESERVATION_CREATIVE_SIZE_MB}MB`
                              : `JPG, PNG, WebP or PDF · Max ${MAX_RESERVATION_CREATIVE_SIZE_MB}MB`}
                          </span>
                          {isDigital ? (
                            <span className="text-[11px] font-semibold text-blue-600">
                              Video must be shorter than {MAX_CREATIVE_VIDEO_DURATION_SECONDS}{' '}
                              seconds
                            </span>
                          ) : null}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={
                            isDigital
                              ? '.png,.jpg,.jpeg,.webp,.pdf,.mp4,.webm,.mov,image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/webm,video/quicktime'
                              : '.png,.jpg,.jpeg,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf'
                          }
                          className="sr-only"
                          disabled={uploadingCreative}
                          onChange={(event) => onCreativeSelected(event.target.files?.[0] ?? null)}
                        />
                        {creative ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="size-3.5" aria-hidden />
                            <span>
                              Uploaded {creative.name} · {(creative.size / 1024 / 1024).toFixed(1)}{' '}
                              MB
                            </span>
                            {creative.durationSeconds ? (
                              <span className="rounded-md bg-emerald-50 px-2 py-0.5">
                                {creative.durationSeconds.toFixed(1)}s video
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                        {uploadError ? (
                          <p className="mt-2 text-xs text-amber-600" role="alert">
                            {uploadError} You can still submit and add the creative later.
                          </p>
                        ) : null}
                      </div>
                      <div className="rounded-xl border border-zinc-200 p-4">
                        <p className="text-sm font-semibold">Creative Guidelines</p>
                        <ul className="mt-3 space-y-2">
                          {creativeGuidelines.map((item) => (
                            <li
                              key={item}
                              className="flex items-center gap-2 text-xs text-zinc-600"
                            >
                              <Check className="size-3.5 text-emerald-600" aria-hidden />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Section>

                  {/* 5. Billing Details */}
                  <Section number={5} title="Billing Details">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field
                        label="Billing Contact Name"
                        required
                        registration={register('billing.contactName')}
                        error={errors.billing?.contactName?.message}
                        maxLength={120}
                        placeholder="Full name"
                      />
                      <Field
                        label="Email Address"
                        required
                        type="email"
                        registration={register('billing.email')}
                        error={errors.billing?.email?.message}
                        placeholder="name@company.com"
                      />
                      <Field
                        label="Phone Number"
                        required
                        registration={register('billing.phone')}
                        error={errors.billing?.phone?.message}
                        maxLength={30}
                        placeholder="+961 70 123 456"
                      />
                      <Field
                        label="VAT Number (Optional)"
                        registration={register('billing.vatNumber')}
                        error={errors.billing?.vatNumber?.message}
                        maxLength={40}
                        placeholder="1234567-601"
                      />
                    </div>
                  </Section>

                  {/* 6. Company Details */}
                  <Section number={6} title="Company Details">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field
                        label="Company Name"
                        required
                        registration={register('company.name')}
                        error={errors.company?.name?.message}
                        maxLength={160}
                        placeholder="Company SAL"
                      />
                      <Field
                        label="Commercial Register (Optional)"
                        registration={register('company.commercialRegister')}
                        error={errors.company?.commercialRegister?.message}
                        maxLength={60}
                        placeholder="1234567"
                      />
                      <Field
                        label="Company Address"
                        required
                        registration={register('company.address')}
                        error={errors.company?.address?.message}
                        maxLength={200}
                        placeholder="Street, City, Country"
                      />
                      <Field
                        label="Country"
                        required
                        registration={register('company.country')}
                        error={errors.company?.country?.message}
                        maxLength={80}
                        placeholder="Lebanon"
                      />
                    </div>
                  </Section>

                  {hasErrors ? (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      Some fields need your attention — the highlighted fields above show what to
                      fix.
                    </p>
                  ) : null}
                  {serverError ? (
                    <p
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {serverError}
                    </p>
                  ) : null}

                  {/* Step 1 CTA → review */}
                  <div className="flex flex-col gap-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-blue-600">
                        <ShieldCheck className="size-5" aria-hidden />
                      </span>
                      <div>
                        <p className="font-semibold text-zinc-900">
                          Ready to review your reservation?
                        </p>
                        <p className="mt-0.5 text-sm text-zinc-500">
                          We&apos;ll check availability and confirm the details before payment.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void startReview()}
                      disabled={!isBookable}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                    >
                      Continue to review
                      <ArrowRight className="size-4" aria-hidden />
                    </button>
                  </div>
                </>
              ) : null}

              {/* Step 2: Review & Confirm */}
              {step === 2 ? (
                <div className="space-y-5">
                  <ReservationReview
                    billboard={billboard}
                    billboardType={isDigital ? 'Digital billboard' : 'Static billboard'}
                    campaignName={campaignName}
                    startDate={startDate}
                    endDate={endDate}
                    days={days}
                    creative={creative}
                    total={money.format(pricing.total)}
                    currency={currency}
                  />
                  {serverError ? (
                    <p
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {serverError}
                    </p>
                  ) : null}
                  <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        scrollTop();
                      }}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-300 px-5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
                    >
                      Back to details
                    </button>
                    <button
                      type="button"
                      onClick={continueToPayment}
                      disabled={!isBookable}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                    >
                      Continue to payment
                      <ArrowRight className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Step 3: Payment & Invoice */}
              {step === 3 ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                        <Lock className="size-4.5" aria-hidden />
                      </span>
                      <div>
                        <h2 className="text-base font-semibold text-blue-950">
                          Choose how you want to pay
                        </h2>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-blue-900/70">
                          Your reservation is submitted after this step. Card payments are only
                          collected after our team confirms the requested billboard dates.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Section number={7} title="Payment Method">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {PAYMENT_OPTIONS.map((option) => {
                        const selected = paymentMethod === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => {
                              if (selected) return;
                              setServerError(null);
                              setValue('paymentMethod', option.value, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              setValue('stripeSetupIntentId', undefined, {
                                shouldValidate: false,
                              });
                              setVisaReady(false);
                            }}
                            className={`flex min-h-28 flex-col gap-2 rounded-xl border p-4 text-left transition-all duration-200 active:scale-[0.99] ${
                              selected
                                ? 'border-blue-600 bg-blue-50/60 shadow-sm ring-1 ring-blue-200'
                                : 'border-zinc-200 bg-white hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-sm'
                            }`}
                          >
                            <span className="flex items-center justify-between">
                              <option.icon
                                className={`size-5 ${selected ? 'text-blue-700' : 'text-zinc-500'}`}
                                aria-hidden
                              />
                              <span
                                className={`flex size-4 items-center justify-center rounded-full border ${
                                  selected ? 'border-blue-600 bg-blue-600' : 'border-zinc-300'
                                }`}
                              >
                                {selected ? (
                                  <Check className="size-3 text-white" aria-hidden />
                                ) : null}
                              </span>
                            </span>
                            <span className="mt-auto text-sm font-semibold text-zinc-900">
                              {option.label}
                            </span>
                            <span className="text-[11px] leading-4 text-zinc-500">
                              {option.hint}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-zinc-500">
                      <Info className="mt-0.5 size-3.5 shrink-0 text-blue-600" aria-hidden />
                      {isCardPayment
                        ? 'Stripe verifies and saves your Visa now without charging it. Payment is collected only after the dates are approved.'
                        : `Our team will send the ${paymentLabel.toLowerCase()} instructions after the requested dates are approved.`}
                    </p>
                  </Section>

                  <Section
                    number={8}
                    title={
                      isCardPayment ? 'Visa & Invoice Details' : 'Cash / Whish & Invoice Details'
                    }
                  >
                    {isCardPayment ? (
                      <VisaPaymentDetails
                        billingName={billingName}
                        billingEmail={billingEmail}
                        onConfirmReady={setVisaConfirm}
                        onReadyChange={setVisaDetailsReady}
                      />
                    ) : (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
                        <div className="flex items-start gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
                            <Wallet className="size-4.5" aria-hidden />
                          </span>
                          <div>
                            <p className="font-semibold text-amber-950">
                              Pay with cash or through Whish
                            </p>
                            <p className="mt-1 text-sm leading-6 text-amber-900/75">
                              No payment is collected today. After the billboard dates are approved,
                              Boardly will send the exact amount, Whish receiver details, and
                              payment reference to your invoice email.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 border-t border-zinc-200 pt-5">
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-zinc-900">Invoice details</p>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                          We use these details for the reservation quote, receipt, and final
                          invoice.
                        </p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label className={labelClass} htmlFor="currency">
                            Invoice Currency
                          </label>
                          <select
                            id="currency"
                            className={inputClass}
                            {...register('invoice.currency')}
                          >
                            {BOOKING_CURRENCIES.map((code) => (
                              <option key={code} value={code}>
                                {code}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Field
                          label="Invoice Email"
                          required
                          type="email"
                          registration={register('invoice.email')}
                          error={errors.invoice?.email?.message}
                          placeholder="accounts@company.com"
                        />
                        <Field
                          label="PO Number (Optional)"
                          registration={register('invoice.poNumber')}
                          error={errors.invoice?.poNumber?.message}
                          maxLength={60}
                          placeholder="PO-2025-091"
                        />
                      </div>
                    </div>
                    <FieldError message={errors.stripeSetupIntentId?.message} />
                  </Section>

                  <Section number={9} title="Terms & Conditions">
                    <label className="flex items-start gap-3 text-sm text-zinc-700">
                      <input
                        type="checkbox"
                        aria-invalid={errors.termsAccepted ? true : undefined}
                        className="mt-0.5 size-4 accent-blue-600"
                        {...register('termsAccepted')}
                      />
                      <span>
                        I agree to the{' '}
                        <Link
                          href="/terms"
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Terms &amp; Conditions and Advertising Policies
                        </Link>
                        .
                      </span>
                    </label>
                    <FieldError message={errors.termsAccepted?.message} />
                  </Section>

                  {submitCount > 0 && hasErrors ? (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      Review the highlighted payment, invoice, or agreement details before
                      submitting.
                    </p>
                  ) : null}
                  {serverError ? (
                    <p
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {serverError}
                    </p>
                  ) : null}

                  <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setServerError(null);
                        setStep(2);
                        scrollTop();
                      }}
                      disabled={status === 'submitting'}
                      className="inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-300 px-5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60"
                    >
                      Back to review
                    </button>
                    <button
                      type="button"
                      onClick={() => void securePaymentAndSubmit()}
                      disabled={
                        status === 'submitting' || !isBookable || (isCardPayment && !visaReady)
                      }
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                    >
                      {status === 'submitting'
                        ? isCardPayment
                          ? 'Securing Visa…'
                          : 'Submitting…'
                        : isCardPayment
                          ? 'Secure Visa & submit'
                          : 'Submit reservation'}
                      <ArrowRight className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Sidebar */}
            <aside className="space-y-4 lg:sticky lg:top-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold">Order Summary</h2>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                    {billboard.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={billboard.images[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{billboard.name}</p>
                    <p className="text-xs text-zinc-500">
                      {isDigital ? 'Digital Billboard' : 'Static Billboard'}
                    </p>
                  </div>
                </div>

                <dl className="mt-4 space-y-2.5 border-t border-zinc-100 pt-4 text-sm">
                  <SummaryRow icon={MapPin} label="Location" value={`${billboard.location.city}`} />
                  <SummaryRow
                    icon={Monitor}
                    label="Format"
                    value={`${isDigital ? 'Digital' : 'Static'} (${billboard.dimensions.width}m × ${billboard.dimensions.height}m)`}
                  />
                </dl>

                <div className="mt-4 border-t border-zinc-100 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Campaign Dates</span>
                    <span className="font-medium text-zinc-800">
                      {days > 0 ? `${days} Days` : '—'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {formatDate(startDate)} – {formatDate(endDate)}
                  </p>
                  {estImpressions ? (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Impressions (Est.)</span>
                        <span className="font-medium text-zinc-800">
                          {estImpressions.toLocaleString()}+
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Daily Impressions (Est.)</span>
                        <span className="font-medium text-zinc-800">
                          {dailyImpressions?.toLocaleString()}+
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>

                <dl className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Subtotal</dt>
                    <dd className="font-medium">{money.format(pricing.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="flex items-center gap-1 text-zinc-500">
                      Service Fee <Info className="size-3 text-zinc-400" aria-hidden />
                    </dt>
                    <dd className="font-medium">{money.format(pricing.serviceFee)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="flex items-center gap-1 text-zinc-500">
                      VAT (11%) <Info className="size-3 text-zinc-400" aria-hidden />
                    </dt>
                    <dd className="font-medium">{money.format(pricing.vat)}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-end justify-between border-t border-zinc-100 pt-4">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-semibold tracking-tight">
                    {money.format(pricing.total)}
                    <span className="ml-1 text-xs font-medium text-zinc-400">{currency}</span>
                  </span>
                </div>

                <p className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800">
                  <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  Prices are estimated. Final amount may vary based on availability and
                  specifications.
                </p>

                <button
                  type="button"
                  onClick={sidebarPrimary}
                  disabled={
                    !isBookable ||
                    status === 'submitting' ||
                    (step === 3 && isCardPayment && !visaReady)
                  }
                  className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  <Lock className="size-4" aria-hidden />
                  {sidebarLabel}
                </button>
                <p className="mt-2 text-center text-[11px] text-zinc-400">
                  Secure &amp; encrypted checkout
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <MessageCircle className="size-5 text-blue-600" aria-hidden />
                  <p className="text-sm font-semibold">Need Help?</p>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  Our team is here to help you complete your reservation.
                </p>
                <p className="mt-3 flex items-center gap-2 text-sm text-zinc-700">
                  <Phone className="size-4 text-zinc-400" aria-hidden /> +961 1 234 567
                </p>
                <p className="mt-1.5 flex items-center gap-2 text-sm text-zinc-700">
                  <Mail className="size-4 text-zinc-400" aria-hidden /> support@boardly.com
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold">Why Advertise With Us?</p>
                <ul className="mt-3 space-y-3">
                  <WhyItem
                    title="Premium Locations"
                    text="High visibility in top Lebanese cities."
                  />
                  <WhyItem title="Verified Traffic" text="Real-time audience insights." />
                  <WhyItem title="End-to-End Support" text="From booking to campaign launch." />
                  <WhyItem title="Secure Transactions" text="Your payment information is safe." />
                </ul>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold">FAQ</p>
                <div className="mt-2 divide-y divide-zinc-100">
                  {FAQ_ITEMS.map((item) => (
                    <details key={item.q} className="group py-2.5">
                      <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-zinc-700">
                        {item.q}
                        <span className="text-zinc-400 transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="mt-2 text-xs leading-5 text-zinc-500">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function Stepper({
  activeStep,
  onStepSelect,
}: {
  activeStep: number;
  onStepSelect: (step: 1 | 2 | 3) => void;
}) {
  return (
    <ol className="mt-5 flex items-center gap-2 overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-3 text-sm sm:gap-3">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const done = step < activeStep;
        const active = step === activeStep;
        const canReview = done && activeStep < 4 && step <= 3;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              disabled={!canReview}
              onClick={() => {
                if (canReview) onStepSelect(step as 1 | 2 | 3);
              }}
              aria-current={active ? 'step' : undefined}
              aria-label={canReview ? `Review ${label}` : undefined}
              className={`group flex shrink-0 items-center gap-2 rounded-xl px-1.5 py-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                canReview ? 'cursor-pointer hover:bg-blue-50' : 'cursor-default'
              }`}
            >
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : done
                      ? 'bg-blue-100 text-blue-700 group-hover:bg-blue-200'
                      : 'bg-zinc-100 text-zinc-400'
                }`}
              >
                {done ? <Check className="size-3.5" aria-hidden /> : step}
              </span>
              <span
                className={`text-xs font-medium whitespace-nowrap sm:text-sm ${
                  active ? 'text-zinc-900' : done ? 'text-blue-700' : 'text-zinc-400'
                }`}
              >
                {label}
              </span>
            </button>
            {index < STEPS.length - 1 ? (
              <span className="mx-1 hidden h-px flex-1 bg-zinc-200 sm:block" aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function Section({
  number,
  title,
  subtitle,
  children,
}: {
  number: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-baseline gap-2">
        <h2 className="text-base font-semibold text-zinc-900">
          {number}. {title}
        </h2>
        {subtitle ? <span className="text-xs text-zinc-400">{subtitle}</span> : null}
      </div>
      {children}
    </section>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

function Field({
  label,
  registration,
  error,
  placeholder,
  required,
  type = 'text',
  maxLength,
}: {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        className={error ? inputErrorClass : inputClass}
        {...registration}
      />
      <FieldError message={error} />
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
      {children}
    </span>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-1.5 text-zinc-500">
        <Icon className="size-3.5 text-zinc-400" aria-hidden />
        {label}
      </dt>
      <dd className="truncate text-right font-medium text-zinc-800">{value}</dd>
    </div>
  );
}

function ReservationReview({
  billboard,
  billboardType,
  campaignName,
  startDate,
  endDate,
  days,
  creative,
  total,
  currency,
}: {
  billboard: PublicBillboard;
  billboardType: string;
  campaignName: string;
  startDate: string;
  endDate: string;
  days: number;
  creative: {
    name: string;
    size: number;
    url: string;
    type: BookingCreativeType;
    durationSeconds?: number;
  } | null;
  total: string;
  currency: BookingCurrency;
}) {
  const creativeDetails = creative
    ? [
        `${(creative.size / 1024 / 1024).toFixed(1)} MB`,
        creative.durationSeconds ? `${creative.durationSeconds.toFixed(1)}s video` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : 'Optional — you can provide it after booking';

  return (
    <section aria-labelledby="reservation-review-title">
      <Card className="gap-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-0 shadow-sm ring-0">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 border-b border-zinc-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 id="reservation-review-title" className="text-base font-semibold text-zinc-900">
                Review your reservation
              </h2>
              <p className="mt-1.5 max-w-xl text-xs leading-5 text-zinc-500">
                Confirm the location, campaign dates, campaign, and creative before choosing
                payment.
              </p>
            </div>
            <div className="shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
                Estimated total
              </p>
              <p className="mt-0.5 text-2xl font-semibold tracking-tight text-zinc-950 tabular-nums">
                {total}
              </p>
              <p className="text-right text-[11px] font-medium text-zinc-400">{currency}</p>
            </div>
          </div>

          <div className="grid gap-3 py-5 sm:grid-cols-2" aria-live="polite">
            <ReviewItem
              icon={Monitor}
              tone="info"
              label="Selected billboard"
              value={billboard.name}
              sub={`${billboardType} · ${billboard.location.city}`}
            />
            <ReviewItem
              icon={CalendarDays}
              tone={days > 0 ? 'success' : 'warning'}
              label="Campaign dates"
              value={`${formatDate(startDate)} – ${formatDate(endDate)}`}
              sub={days > 0 ? `${days} ${days === 1 ? 'day' : 'days'}` : 'Choose valid dates'}
              needsAttention={days < 1}
            />
            <ReviewItem
              icon={FileCheck2}
              tone={campaignName.trim() ? 'success' : 'warning'}
              label="Campaign"
              value={campaignName.trim() || 'Campaign name needed'}
              sub="Used on your reservation and invoice"
              needsAttention={!campaignName.trim()}
            />
            <ReviewItem
              icon={UploadCloud}
              tone={creative ? 'success' : 'neutral'}
              label="Creative"
              value={creative?.name ?? 'To be provided later'}
              sub={creativeDetails}
            />
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <CreditCard className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-[11px] font-medium tracking-wide text-blue-700 uppercase">
                  Next step
                </p>
                <p className="text-sm font-semibold text-blue-950">
                  Choose payment and invoice details
                </p>
              </div>
            </div>
            <p className="flex items-center gap-2 text-xs font-medium text-blue-800">
              <Info className="size-4" aria-hidden />
              You can return here before submitting
            </p>
          </div>
          <p className="mt-3 text-right text-[11px] text-zinc-500">
            Dates and availability are checked again when you submit.
          </p>
        </div>
      </Card>
    </section>
  );
}

function ReviewItem({
  icon: Icon,
  tone,
  label,
  value,
  sub,
  needsAttention = false,
}: {
  icon: typeof Monitor;
  tone: 'info' | 'success' | 'warning' | 'neutral';
  label: string;
  value: string;
  sub?: string;
  needsAttention?: boolean;
}) {
  const toneStyles = {
    info: {
      card: 'border-blue-100 bg-blue-50/60',
      icon: 'bg-blue-100 text-blue-700',
      label: 'text-blue-700',
      value: 'text-blue-950',
      sub: 'text-blue-800/70',
    },
    success: {
      card: 'border-emerald-100 bg-emerald-50/60',
      icon: 'bg-emerald-100 text-emerald-700',
      label: 'text-emerald-700',
      value: 'text-emerald-950',
      sub: 'text-emerald-800/70',
    },
    warning: {
      card: 'border-amber-100 bg-amber-50/70',
      icon: 'bg-amber-100 text-amber-700',
      label: 'text-amber-700',
      value: 'text-amber-950',
      sub: 'text-amber-800/70',
    },
    neutral: {
      card: 'border-zinc-200 bg-zinc-50/80',
      icon: 'bg-zinc-200 text-zinc-600',
      label: 'text-zinc-500',
      value: 'text-zinc-900',
      sub: 'text-zinc-500',
    },
  }[tone];

  return (
    <div
      className={`flex min-w-0 items-start gap-3 rounded-xl border p-4 ${toneStyles.card} ${
        needsAttention ? 'ring-1 ring-amber-200 ring-inset' : ''
      }`}
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${toneStyles.icon}`}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className={`text-[11px] font-medium tracking-wide uppercase ${toneStyles.label}`}>
          {label}
        </p>
        <p className={`mt-0.5 text-sm leading-5 font-semibold break-words ${toneStyles.value}`}>
          {value}
        </p>
        {sub ? <p className={`mt-0.5 text-[11px] leading-4 ${toneStyles.sub}`}>{sub}</p> : null}
      </div>
    </div>
  );
}

function WhyItem({ title, text }: { title: string; text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
        <Check className="size-3.5" aria-hidden />
      </span>
      <div>
        <p className="text-xs font-semibold text-zinc-800">{title}</p>
        <p className="text-[11px] text-zinc-500">{text}</p>
      </div>
    </li>
  );
}

function ConfirmationPanel({
  booking,
  billboard,
  money,
}: {
  booking: Booking;
  billboard: PublicBillboard;
  money: Intl.NumberFormat;
}) {
  return (
    <div className="mx-auto mt-8 max-w-2xl">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-8" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Reservation submitted</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Thanks — your request for{' '}
          <span className="font-medium text-zinc-800">{billboard.name}</span> is in. Our team will
          confirm availability and email you the next steps.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
            Ref {booking.reference}
          </span>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 capitalize">
            {booking.status === 'pending' ? 'Pending review' : booking.status}
          </span>
        </div>

        <dl className="mt-6 grid gap-3 rounded-xl border border-zinc-200 p-4 text-left text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-400">Campaign</dt>
            <dd className="font-medium text-zinc-800">{booking.campaignName}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400">Dates</dt>
            <dd className="font-medium text-zinc-800">
              {formatDate(booking.startDate)} – {formatDate(booking.endDate)} (
              {booking.pricing.days} days)
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400">Estimated total</dt>
            <dd className="font-medium text-zinc-800">{money.format(booking.pricing.total)}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400">Billing contact</dt>
            <dd className="font-medium text-zinc-800">{booking.billing.contactName}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-zinc-400">Payment method</dt>
            <dd className="font-medium text-zinc-800">
              {booking.paymentMethod === PAYMENT_METHODS.CARD
                ? 'Visa verified securely by Stripe · payment after approval'
                : 'Cash / Whish · instructions after approval'}
            </dd>
          </div>
        </dl>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/user/advertiser/bookings"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            View my reservations
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/billboards"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-300 px-5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Browse more billboards
            <ExternalLink className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-400">
        <Building2 className="size-3.5" aria-hidden />
        Boardly · Beirut, Lebanon
      </p>
    </div>
  );
}
