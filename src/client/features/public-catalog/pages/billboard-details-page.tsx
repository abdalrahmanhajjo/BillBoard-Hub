import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Expand,
  ExternalLink,
  Globe2,
  Lightbulb,
  MapPin,
  Maximize2,
  MessageCircleQuestion,
  Monitor,
  UploadCloud,
} from 'lucide-react';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import type { PublicBillboard, PublicDigitalSpec } from '@/shared/types/billboard';
import { BillboardGallery } from '@/client/features/public-catalog/components/billboard-gallery';
import { BillboardGrid } from '@/client/features/public-catalog/components/billboard-grid';
import { CampaignBookingCard } from '@/client/features/public-catalog/components/campaign-booking-card';
import { formatMonthlyPrice } from '@/client/features/public-catalog/utils/format-price';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/client/ui/components/ui/accordion';
import { Button } from '@/client/ui/components/ui/button';
import { Input } from '@/client/ui/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/ui/components/ui/select';
import { Textarea } from '@/client/ui/components/ui/textarea';
import { Card } from '@/client/ui/components/ui/card';
import { ReserveButton } from '@/client/features/public-catalog/components/reserve-button';
import { DigitalSpecShowcase } from '@/client/features/public-catalog/components/digital-spec-showcase';

const trafficFormatter = new Intl.NumberFormat('en-US');

type BillboardDetailsPageProps = {
  billboard: PublicBillboard;
  spec: PublicDigitalSpec | null;
  relatedBillboards: PublicBillboard[];
};

const faqs = [
  {
    question: 'How do I request this billboard?',
    answer:
      'Send a reservation request with your campaign dates and goals. The Boardly team will confirm availability and next steps.',
  },
  {
    question: 'What is included in the monthly price?',
    answer:
      'The displayed price is the monthly media rate. Production, installation, taxes, and special technical requirements are confirmed separately.',
  },
  {
    question: 'How long is the minimum campaign?',
    answer:
      'The standard planning period is four weeks, subject to availability and the final campaign agreement.',
  },
  {
    question: 'Can I provide my own artwork?',
    answer: 'Yes. You can share campaign artwork with the team after your request is reviewed.',
  },
  {
    question: 'How is availability confirmed?',
    answer:
      'The public status is updated from inventory data, and the team performs a final availability check before confirming any reservation.',
  },
];

function formatTraffic(value?: number): string {
  return value === undefined ? 'Not listed' : `${trafficFormatter.format(value)} vehicles`;
}

export function BillboardDetailsPage({
  billboard,
  spec,
  relatedBillboards,
}: BillboardDetailsPageProps) {
  const { location, dimensions } = billboard;
  const isDigital = billboard.type === BILLBOARD_TYPES.DIGITAL;
  const typeLabel = isDigital ? 'Digital screen' : 'Static billboard';
  const orientation = dimensions.width >= dimensions.height ? 'Landscape' : 'Portrait';
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${location.address}, ${location.city}, ${location.country}`,
  )}`;
  const todayIso = new Date().toISOString().slice(0, 10);

  const specifications = [
    {
      icon: MapPin,
      label: 'Location',
      value: `${location.address}, ${location.city}`,
    },
    { icon: Monitor, label: 'Format', value: typeLabel },
    {
      icon: Maximize2,
      label: 'Dimensions',
      value: `${dimensions.width} × ${dimensions.height} ${dimensions.unit}`,
    },
    { icon: Expand, label: 'Orientation', value: orientation },
    { icon: BarChart3, label: 'Monthly traffic', value: formatTraffic(billboard.trafficCount) },
    {
      icon: CalendarCheck,
      label: 'Availability',
      value: billboard.isAvailable ? 'Available' : 'Unavailable',
    },
    {
      icon: Monitor,
      label: 'Display',
      value: isDigital ? 'Digital LED' : 'Printed creative',
    },
    {
      icon: Lightbulb,
      label: 'Placement',
      value: 'Outdoor roadside',
    },
  ];

  return (
    <div className="bg-white text-zinc-950">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-8 lg:px-16 lg:py-12 xl:px-24">
        <Link
          href="/billboards"
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-blue-600"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to billboards
        </Link>

        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            <span>Billboards</span>
            <span aria-hidden>/</span>
            <span>{location.city}</span>
            <span aria-hidden>/</span>
            <span className="text-zinc-800">{billboard.name}</span>
          </div>
          {isDigital ? (
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <Monitor className="size-3.5" aria-hidden />
              Digital LED screen
            </span>
          ) : null}
          <h1 className="mt-5 max-w-4xl text-4xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl">
            {billboard.name}
          </h1>
          <p className="mt-4 flex items-center gap-2 text-sm text-zinc-500 sm:text-base">
            <MapPin className="size-4 shrink-0 text-blue-600" aria-hidden />
            {location.address}, {location.city}, {location.country}
          </p>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:max-w-4xl">
          <QuickFact icon={Monitor} label="Format" value={typeLabel} />
          <QuickFact
            icon={Maximize2}
            label="Dimensions"
            value={`${dimensions.width} × ${dimensions.height} ${dimensions.unit}`}
          />
          <QuickFact
            icon={BarChart3}
            label="Monthly traffic"
            value={formatTraffic(billboard.trafficCount)}
          />
        </div>

        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-10">
          <div>
            <BillboardGallery images={billboard.images} name={billboard.name} />
            {billboard.description ? (
              <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-600">
                {billboard.description}
              </p>
            ) : null}
          </div>

          <Card className="gap-0 rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_18px_55px_rgba(24,24,27,.08)] ring-0 lg:sticky lg:top-24">
            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                billboard.isAvailable
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  billboard.isAvailable ? 'bg-emerald-500' : 'bg-zinc-400'
                }`}
                aria-hidden
              />
              {billboard.isAvailable ? 'Available' : 'Unavailable'}
            </div>
            <p className="mt-6 text-xs font-semibold tracking-[0.12em] text-zinc-400 uppercase">
              Monthly price
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-zinc-950">
              {formatMonthlyPrice(billboard.monthlyPrice)}
            </p>
            <div className="my-6 border-y border-zinc-100 py-5">
              <p className="font-semibold text-zinc-900">Reservation request</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Choose your dates and duration in the schedule below. Our team confirms the final
                availability before booking.
              </p>
            </div>
            <a
              href="#campaign-schedule"
              className="mb-3 flex min-h-12 w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700"
            >
              Choose dates and duration
            </a>
            <ReserveButton
              isAvailable={billboard.isAvailable}
              href={`/billboards/${billboard.id}/reservation`}
            />
          </Card>
        </div>

        <section className="mt-16 border-t border-zinc-200 pt-12 lg:mt-24 lg:pt-16">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
            Billboard specifications
          </h2>
          <div className="mt-7 grid overflow-hidden rounded-2xl border border-zinc-200 sm:grid-cols-2 lg:grid-cols-4">
            {specifications.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex min-h-32 items-center gap-4 border-b border-zinc-200 p-5 last:border-b-0 sm:border-r lg:[&:nth-child(-n+4)]:border-b lg:[&:nth-child(4n)]:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-last-child(-n+4)]:border-b-0"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-400">{label}</p>
                  <p className="mt-1 text-sm leading-5 font-semibold text-zinc-900">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {isDigital ? <DigitalSpecShowcase spec={spec} billboard={billboard} /> : null}

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <Card className="h-full min-h-[640px] gap-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-0 ring-0">
            <div className="relative flex min-h-[390px] flex-1 overflow-hidden bg-blue-50 p-5 sm:p-6">
              <div
                aria-hidden
                className="absolute inset-0 [background-image:linear-gradient(#bfdbfe_1px,transparent_1px),linear-gradient(90deg,#bfdbfe_1px,transparent_1px)] [background-size:36px_36px] opacity-45"
              />
              <div
                aria-hidden
                className="absolute top-[18%] -left-[12%] h-5 w-[130%] rotate-[14deg] rounded-full border-y border-blue-200 bg-white/65"
              />
              <div
                aria-hidden
                className="absolute top-[55%] -left-[18%] h-4 w-[140%] -rotate-[19deg] rounded-full border-y border-blue-200 bg-white/70"
              />
              <div
                aria-hidden
                className="absolute -top-[10%] left-[58%] h-[120%] w-4 rotate-[8deg] rounded-full border-x border-blue-200 bg-white/65"
              />

              <div className="relative z-10 flex w-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full border border-blue-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-blue-700 backdrop-blur">
                    Lebanon inventory
                  </span>
                  <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-600 backdrop-blur">
                    {location.city}
                  </span>
                </div>

                <div className="my-auto flex flex-col items-center text-center">
                  <span className="relative flex size-24 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_22px_55px_rgba(37,99,235,.28)]">
                    <span
                      aria-hidden
                      className="absolute -inset-5 rounded-full border border-blue-600/20"
                    />
                    <span
                      aria-hidden
                      className="absolute -inset-10 rounded-full border border-blue-600/10"
                    />
                    <MapPin className="size-10" aria-hidden />
                  </span>
                  <p className="mt-8 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm backdrop-blur">
                    {location.address}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">Selected billboard location</p>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-200 p-5 sm:p-7">
              <p className="text-xs font-semibold tracking-[0.14em] text-blue-600 uppercase">
                Location context
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-zinc-950">
                Positioned in {location.city}
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Open the full address in your preferred maps application for route planning and
                on-site review.
              </p>

              <dl className="mt-6 grid gap-4 border-y border-zinc-100 py-5 min-[420px]:grid-cols-2">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden />
                  <div>
                    <dt className="text-xs text-zinc-400">Address</dt>
                    <dd className="mt-1 text-sm font-semibold text-zinc-800">{location.address}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden />
                  <div>
                    <dt className="text-xs text-zinc-400">City</dt>
                    <dd className="mt-1 text-sm font-semibold text-zinc-800">{location.city}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3 min-[420px]:col-span-2">
                  <Globe2 className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden />
                  <div>
                    <dt className="text-xs text-zinc-400">Country</dt>
                    <dd className="mt-1 text-sm font-semibold text-zinc-800">{location.country}</dd>
                  </div>
                </div>
              </dl>

              <Button
                render={<a href={directionsUrl} target="_blank" rel="noreferrer" />}
                nativeButton={false}
                variant="outline"
                className="mt-6 min-h-12 w-full rounded-xl border-blue-200 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                Get directions
                <ExternalLink className="size-4" aria-hidden />
              </Button>
            </div>
          </Card>

          <CampaignBookingCard
            isAvailable={billboard.isAvailable}
            monthlyPrice={billboard.monthlyPrice}
            todayIso={todayIso}
            billboardId={billboard.id}
            sticky={false}
          />
        </section>

        {relatedBillboards.length > 0 ? (
          <section className="mt-16 lg:mt-24">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                Similar billboards in Lebanon
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Explore other published placements from the live inventory.
              </p>
            </div>
            <div className="mt-7">
              <BillboardGrid billboards={relatedBillboards} />
            </div>
          </section>
        ) : null}

        <section
          id="campaign-inquiry"
          className="mt-16 grid gap-5 lg:mt-24 lg:grid-cols-[1.15fr_.85fr]"
        >
          <form action="/register" className="rounded-2xl border border-zinc-200 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">Start your campaign</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Tell us what you are planning and we will help with the next step.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-zinc-700">
                Campaign objective
                <Select name="objective" defaultValue="awareness">
                  <SelectTrigger className="mt-2 h-12 w-full rounded-xl border-zinc-200 px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="awareness">Build awareness</SelectItem>
                    <SelectItem value="product-launch">Launch a product</SelectItem>
                    <SelectItem value="store-visits">Drive store visits</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="text-sm font-medium text-zinc-700">
                Target audience
                <Select name="audience" defaultValue="mass">
                  <SelectTrigger className="mt-2 h-12 w-full rounded-xl border-zinc-200 px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mass">Mass audience</SelectItem>
                    <SelectItem value="commuters">Commuters</SelectItem>
                    <SelectItem value="residents">Local residents</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>
            <label className="mt-4 block text-sm font-medium text-zinc-700">
              Campaign message
              <Textarea
                name="message"
                rows={4}
                placeholder="Share your goals, dates, and any creative requirements."
                className="mt-2 w-full resize-none rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-blue-500"
              />
            </label>
            <label className="mt-4 flex min-h-24 cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-blue-300 bg-blue-50/40 px-4 text-center text-sm text-blue-700">
              <UploadCloud className="size-5" aria-hidden />
              Add campaign artwork later
              <Input type="file" className="sr-only" accept=".png,.jpg,.jpeg,.pdf" />
            </label>
            <Button
              type="submit"
              className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white sm:w-auto"
            >
              Continue request
            </Button>
          </form>

          <div className="rounded-2xl border border-zinc-200 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <MessageCircleQuestion className="size-5" aria-hidden />
              </span>
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                Frequently asked questions
              </h2>
            </div>
            <Accordion className="mt-6 divide-y divide-zinc-200">
              {faqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger className="px-0 py-4 text-sm font-semibold hover:bg-transparent">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pr-8 text-sm leading-6 text-zinc-500">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="mt-8 flex flex-col gap-5 rounded-2xl border border-blue-200 bg-blue-50/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-blue-600">
              <CheckCircle2 className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-semibold text-zinc-900">Need help with your booking?</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Our team can assist with availability, pricing, and campaign planning.
              </p>
            </div>
          </div>
          <Link
            href="/#contact"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-blue-700 shadow-sm"
          >
            Contact assistance
          </Link>
        </section>
      </div>
    </div>
  );
}

function QuickFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Monitor;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4">
      <Icon className="size-5 shrink-0 text-blue-600" aria-hidden />
      <div>
        <p className="text-xs text-zinc-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-zinc-900">{value}</p>
      </div>
    </div>
  );
}
