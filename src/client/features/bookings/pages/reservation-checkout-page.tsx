'use client';

import { useRef, useState } from 'react';
import { useForm, useWatch, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import {
  ArrowRight,
  Banknote,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Info,
  Landmark,
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
  BOOKING_CURRENCIES,
  CAMPAIGN_OBJECTIVES,
  DIGITAL_RESERVATION_DAILY_LIMIT,
  PAYMENT_METHODS,
} from '@/shared/constants/booking';
import { computeBookingPricing, inclusiveDays } from '@/shared/pricing/booking-pricing';
import type { PublicBillboard } from '@/shared/types/billboard';
import type {
  Booking,
  BookingCurrency,
  CampaignObjective,
  PaymentMethod,
} from '@/shared/types/booking';
import {
  createBookingSchema,
  type CreateBookingSchemaInput,
} from '@/shared/contracts/booking/booking.schema';
import { uploadCreativeAsset } from '@/client/features/creatives/services/creative-upload.service';
import { bookingClientService } from '@/client/features/bookings/services/booking-client.service';

type Viewer = { fullName: string; email: string; role: string } | null;

type ReservationCheckoutPageProps = {
  billboard: PublicBillboard;
  viewer: Viewer;
  initialStart?: string;
  initialEnd?: string;
};

const STEPS = ['Booking Details', 'Review & Confirm', 'Payment', 'Confirmation'];

const OBJECTIVE_OPTIONS: { value: CampaignObjective; label: string }[] = [
  { value: CAMPAIGN_OBJECTIVES.AWARENESS, label: 'Drive brand awareness' },
  { value: CAMPAIGN_OBJECTIVES.PRODUCT_LAUNCH, label: 'Launch a product' },
  { value: CAMPAIGN_OBJECTIVES.STORE_VISITS, label: 'Drive store visits' },
  { value: CAMPAIGN_OBJECTIVES.ENGAGEMENT, label: 'Boost engagement' },
];

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  hint: string;
  icon: typeof CreditCard;
}[] = [
  {
    value: PAYMENT_METHODS.CARD,
    label: 'Credit / Debit Card',
    hint: 'Visa, Mastercard, Amex',
    icon: CreditCard,
  },
  {
    value: PAYMENT_METHODS.BANK_TRANSFER,
    label: 'Bank Transfer',
    hint: 'Manual transfer',
    icon: Landmark,
  },
  {
    value: PAYMENT_METHODS.E_WALLET,
    label: 'e-Wallet',
    hint: 'OMT, Whish, Money Touch',
    icon: Wallet,
  },
  {
    value: PAYMENT_METHODS.CASH,
    label: 'Cash to Boardly',
    hint: 'Pay at our office by appointment',
    icon: Banknote,
  },
];

const CREATIVE_GUIDELINES = [
  'High resolution images',
  'No animated content',
  'Maintain safe area',
  'Text readability',
  'Avoid small fonts',
];

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
    a: 'High-resolution JPG, PNG, or PDF up to 100MB. Recommended 1920 × 1080 px for digital screens.',
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
      billing: {
        contactName: viewer?.fullName ?? '',
        email: viewer?.email ?? '',
        phone: '',
        vatNumber: '',
      },
      company: { name: '', commercialRegister: '', address: '', country: 'Lebanon' },
      paymentMethod: PAYMENT_METHODS.CARD,
      invoice: { currency: 'USD', email: viewer?.email ?? '', poNumber: '' },
      termsAccepted: false,
    },
  });

  // Watched values that drive the live quote, review, and character counters.
  const startDate = useWatch({ control, name: 'startDate' }) ?? defaultStart;
  const endDate = useWatch({ control, name: 'endDate' }) ?? defaultEnd;
  const currency = (useWatch({ control, name: 'invoice.currency' }) ?? 'USD') as BookingCurrency;
  const paymentMethod = useWatch({ control, name: 'paymentMethod' }) ?? PAYMENT_METHODS.CARD;
  const targetAudienceValue = useWatch({ control, name: 'targetAudience' }) ?? '';
  const briefValue = useWatch({ control, name: 'brief' }) ?? '';
  const notesValue = useWatch({ control, name: 'notes' }) ?? '';

  const [creative, setCreative] = useState<{ name: string; size: number; url: string } | null>(
    null,
  );
  const [uploadingCreative, setUploadingCreative] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<'form' | 'submitting' | 'confirmed'>('form');
  const [serverError, setServerError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  const days = inclusiveDays(startDate, endDate);
  const pricing = computeBookingPricing(billboard.monthlyPrice, Math.max(days, 0));
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency });
  const dailyImpressions = billboard.trafficCount;
  const estImpressions = dailyImpressions ? dailyImpressions * Math.max(days, 0) : undefined;
  const activeStep = status === 'confirmed' ? 4 : 1;
  const hasErrors = Object.keys(errors).length > 0;

  const onCreativeSelected = async (file: File | null) => {
    if (!file) return;
    setUploadError(null);
    setUploadingCreative(true);
    try {
      const url = await uploadCreativeAsset(file);
      setCreative({ name: file.name, size: file.size, url });
      setValue('creativeUrl', url, { shouldValidate: true });
    } catch (uploadErr) {
      setUploadError(uploadErr instanceof Error ? uploadErr.message : 'Upload failed.');
    } finally {
      setUploadingCreative(false);
    }
  };

  const onValid = async (values: CreateBookingSchemaInput) => {
    setServerError(null);
    setStatus('submitting');
    const result = await bookingClientService.create(values);
    if (!result.ok) {
      setServerError(result.error ?? 'Reservation failed. Please try again.');
      setStatus('form');
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setBooking((result.data as Booking | undefined) ?? null);
    setStatus('confirmed');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onInvalid = () => {
    if (typeof window !== 'undefined') {
      document
        .querySelector('[aria-invalid="true"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const submitForm = handleSubmit(onValid, onInvalid);

  const attemptSubmit = () => {
    setServerError(null);
    if (!viewer) {
      window.location.href = `/login?callbackUrl=/billboards/${billboard.id}/reservation`;
      return;
    }
    if (!isBookable) {
      setServerError('This billboard is not currently available for booking.');
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    void submitForm();
  };

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

        <Stepper activeStep={activeStep} />

        {status === 'confirmed' && booking ? (
          <ConfirmationPanel booking={booking} billboard={billboard} money={money} />
        ) : (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              attemptSubmit();
            }}
            className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
          >
            <div className="space-y-5">
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
                    This is a digital screen — it rotates up to {
                      DIGITAL_RESERVATION_DAILY_LIMIT
                    }{' '}
                    ads, so your dates only clash when it is fully booked.
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
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/60 px-4 py-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/40"
                    >
                      <UploadCloud className="size-7 text-zinc-400" aria-hidden />
                      <span className="text-sm font-medium text-zinc-700">
                        {uploadingCreative
                          ? 'Uploading…'
                          : creative
                            ? creative.name
                            : 'Drag & drop your file here'}
                      </span>
                      <span className="text-xs text-zinc-400">or click to choose a file</span>
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700">
                        Choose File
                      </span>
                      <span className="mt-2 text-[11px] text-zinc-400">
                        JPG, PNG, PDF · Max 100MB · Recommended 1920 × 1080 px
                      </span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf,image/*,video/*"
                      className="sr-only"
                      onChange={(event) => onCreativeSelected(event.target.files?.[0] ?? null)}
                    />
                    {creative ? (
                      <p className="mt-2 text-xs font-medium text-emerald-700">
                        Uploaded {creative.name} · {(creative.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    ) : null}
                    {uploadError ? (
                      <p className="mt-2 text-xs text-amber-600">
                        {uploadError} You can still submit and add the creative later.
                      </p>
                    ) : null}
                  </div>
                  <div className="rounded-xl border border-zinc-200 p-4">
                    <p className="text-sm font-semibold">Creative Guidelines</p>
                    <ul className="mt-3 space-y-2">
                      {CREATIVE_GUIDELINES.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-xs text-zinc-600">
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

              {/* 7. Payment Method */}
              <Section number={7} title="Payment Method">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {PAYMENT_OPTIONS.map((option) => {
                    const selected = paymentMethod === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setValue('paymentMethod', option.value, { shouldValidate: true })
                        }
                        className={`flex flex-col gap-2 rounded-xl border p-3 text-left transition-colors ${
                          selected
                            ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-200'
                            : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <option.icon className="size-5 text-zinc-500" aria-hidden />
                          <span
                            className={`flex size-4 items-center justify-center rounded-full border ${
                              selected ? 'border-blue-600 bg-blue-600' : 'border-zinc-300'
                            }`}
                          >
                            {selected ? <Check className="size-3 text-white" aria-hidden /> : null}
                          </span>
                        </span>
                        <span className="text-sm font-semibold text-zinc-900">{option.label}</span>
                        <span className="text-[11px] text-zinc-500">{option.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* 8. Invoice Preferences */}
              <Section number={8} title="Invoice Preferences">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className={labelClass} htmlFor="currency">
                      Invoice Currency
                    </label>
                    <select id="currency" className={inputClass} {...register('invoice.currency')}>
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
              </Section>

              {/* 9. Terms & Conditions */}
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
                    <Link href="/#faq" className="font-medium text-blue-600 hover:underline">
                      Terms &amp; Conditions and Advertising Policies
                    </Link>
                    .
                  </span>
                </label>
                <FieldError message={errors.termsAccepted?.message} />
              </Section>

              {/* 10. Review */}
              <Section
                number={10}
                title="Review Your Reservation"
                subtitle="Please review your details before submitting."
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <ReviewItem
                    icon={Monitor}
                    label="Billboard"
                    value={billboard.name}
                    sub={isDigital ? 'Digital Billboard' : 'Static Billboard'}
                  />
                  <ReviewItem
                    icon={CalendarDays}
                    label="Dates"
                    value={`${formatDate(startDate)} – ${formatDate(endDate)}`}
                    sub={days > 0 ? `${days} Days` : undefined}
                  />
                  <ReviewItem
                    icon={UploadCloud}
                    label="Creative"
                    value={creative ? creative.name : 'To be provided'}
                    sub={creative ? `${(creative.size / 1024 / 1024).toFixed(1)} MB` : undefined}
                  />
                  <ReviewItem
                    icon={CreditCard}
                    label="Total"
                    value={money.format(pricing.total)}
                    sub={PAYMENT_OPTIONS.find((option) => option.value === paymentMethod)?.label}
                  />
                </div>
              </Section>

              {submitCount > 0 && hasErrors ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Some fields need your attention — the highlighted fields above show what to fix.
                </p>
              ) : null}
              {serverError ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {serverError}
                </p>
              ) : null}

              {/* Bottom CTA bar */}
              <div className="flex flex-col gap-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-blue-600">
                    <ShieldCheck className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold text-zinc-900">Ready to secure your billboard?</p>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      We&apos;ll confirm availability and email you the next steps.
                    </p>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={status === 'submitting' || !isBookable}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  {status === 'submitting' ? 'Submitting…' : 'Review & Confirm'}
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </div>
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
                  type="submit"
                  disabled={status === 'submitting' || !isBookable}
                  className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  <Lock className="size-4" aria-hidden />
                  {status === 'submitting' ? 'Submitting…' : 'Submit Reservation'}
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
          </form>
        )}
      </div>
    </div>
  );
}

function Stepper({ activeStep }: { activeStep: number }) {
  return (
    <ol className="mt-5 flex items-center gap-2 overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-3 text-sm sm:gap-3">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const done = step < activeStep;
        const active = step === activeStep;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                active
                  ? 'bg-blue-600 text-white'
                  : done
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-zinc-100 text-zinc-400'
              }`}
            >
              {done ? <Check className="size-3.5" aria-hidden /> : step}
            </span>
            <span
              className={`text-xs font-medium whitespace-nowrap sm:text-sm ${
                active ? 'text-zinc-900' : 'text-zinc-400'
              }`}
            >
              {label}
            </span>
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

function ReviewItem({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Monitor;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-200 p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden />
      <div className="min-w-0">
        <p className="text-[11px] text-zinc-400">{label}</p>
        <p className="truncate text-sm font-semibold text-zinc-900">{value}</p>
        {sub ? <p className="text-[11px] text-zinc-500">{sub}</p> : null}
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
        </dl>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard/advertiser/bookings"
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
