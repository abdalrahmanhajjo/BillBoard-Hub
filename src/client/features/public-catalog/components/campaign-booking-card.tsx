'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ReserveButton } from '@/client/features/public-catalog/components/reserve-button';
import { Button } from '@/client/ui/components/ui/button';
import { Card } from '@/client/ui/components/ui/card';
import { Input } from '@/client/ui/components/ui/input';
import { cn } from '@/client/ui/lib/utils';

const durationPresets = [1, 2, 4, 8, 12];
const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});
const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

type CampaignBookingCardProps = {
  isAvailable: boolean;
  monthlyPrice: number;
  todayIso: string;
  sticky?: boolean;
};

function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function toIsoDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(value: Date, days: number): Date {
  const result = new Date(value);
  result.setDate(result.getDate() + days);
  return result;
}

export function CampaignBookingCard({
  isAvailable,
  monthlyPrice,
  todayIso,
  sticky = true,
}: CampaignBookingCardProps) {
  const today = useMemo(() => parseIsoDate(todayIso), [todayIso]);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1, 12),
  );
  const [startDate, setStartDate] = useState(todayIso);
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [customDuration, setCustomDuration] = useState(false);

  const selectedStart = parseIsoDate(startDate);
  const endDate = addDays(selectedStart, durationWeeks * 7 - 1);
  const estimatedTotal = monthlyPrice * (durationWeeks / 4);
  const firstWeekday = visibleMonth.getDay();
  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate();
  const calendarCells = Array.from(
    { length: Math.ceil((firstWeekday + daysInMonth) / 7) * 7 },
    (_, index) => {
      const day = index - firstWeekday + 1;
      return day > 0 && day <= daysInMonth ? day : null;
    },
  );

  const selectDuration = (weeks: number) => {
    setDurationWeeks(weeks);
    setCustomDuration(false);
  };

  return (
    <Card
      id="campaign-schedule"
      className={cn(
        'gap-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_18px_55px_rgba(24,24,27,.08)] ring-0 sm:p-6',
        sticky && 'lg:sticky lg:top-24',
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
            isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
          }`}
        >
          <span
            className={`size-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-zinc-400'}`}
            aria-hidden
          />
          {isAvailable ? 'Available' : 'Unavailable'}
        </div>
        <span className="text-xs text-zinc-400">Request only</span>
      </div>

      <p className="mt-5 text-xs font-semibold tracking-[0.12em] text-zinc-400 uppercase">
        Monthly price
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-zinc-950">
        {currencyFormatter.format(monthlyPrice)}
      </p>

      <div className="my-5 border-y border-zinc-100 py-4">
        <p className="font-semibold text-zinc-900">Choose campaign duration</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Pick a common duration or enter any number of weeks.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {durationPresets.map((weeks) => (
            <Button
              key={weeks}
              type="button"
              variant="outline"
              onClick={() => selectDuration(weeks)}
              className={`min-h-10 rounded-xl border text-xs font-semibold transition-colors ${
                !customDuration && durationWeeks === weeks
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-blue-300'
              }`}
            >
              {weeks} {weeks === 1 ? 'week' : 'weeks'}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setCustomDuration(true)}
            className={`min-h-10 rounded-xl border text-xs font-semibold transition-colors ${
              customDuration
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-zinc-200 text-zinc-600'
            }`}
          >
            Custom
          </Button>
        </div>
        {customDuration ? (
          <label className="mt-3 flex items-center gap-3 text-sm text-zinc-600">
            Number of weeks
            <Input
              type="number"
              min={1}
              max={52}
              value={durationWeeks}
              onChange={(event) =>
                setDurationWeeks(Math.min(52, Math.max(1, Number(event.target.value) || 1)))
              }
              className="h-10 w-20 rounded-lg border border-zinc-200 px-3 font-semibold outline-none focus:border-blue-500"
            />
          </label>
        ) : null}
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-blue-600" aria-hidden />
            <p className="text-sm font-semibold text-zinc-900">
              {monthFormatter.format(visibleMonth)}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              onClick={() =>
                setVisibleMonth(
                  (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1, 12),
                )
              }
              className="flex size-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              onClick={() =>
                setVisibleMonth(
                  (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1, 12),
                )
              }
              className="flex size-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500"
              aria-label="Next month"
            >
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-7 text-center">
          {weekdayLabels.map((label) => (
            <span key={label} className="py-1 text-[10px] font-semibold text-zinc-400">
              {label}
            </span>
          ))}
          {calendarCells.map((day, index) => {
            if (!day) return <span key={`empty-${index}`} className="size-9" />;

            const cellDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day, 12);
            const cellIso = toIsoDate(cellDate);
            const isPast = cellDate < today;
            const isSelected = cellIso === startDate;
            const isInRange = cellDate >= selectedStart && cellDate <= endDate;

            return (
              <Button
                key={cellIso}
                type="button"
                variant="ghost"
                size="icon-lg"
                disabled={isPast}
                onClick={() => setStartDate(cellIso)}
                className={`mx-auto flex size-9 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : isInRange
                      ? 'bg-blue-50 text-blue-700'
                      : isPast
                        ? 'text-zinc-300'
                        : 'text-zinc-700 hover:bg-zinc-100'
                }`}
                aria-label={`Select ${dateFormatter.format(cellDate)} as start date`}
              >
                {day}
              </Button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-500">
          <span className="size-2 rounded-full bg-blue-600" aria-hidden />
          Requested start
          <span className="ml-2 size-2 rounded-full bg-blue-100" aria-hidden />
          Campaign range
        </div>
        <p className="mt-2 text-[11px] leading-5 text-zinc-400">
          Dates are requestable. Final availability is confirmed by the Boardly team.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-zinc-50 p-3">
        <div>
          <p className="text-[10px] text-zinc-400">Start date</p>
          <p className="mt-1 text-xs font-semibold text-zinc-800">
            {dateFormatter.format(selectedStart)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-400">End date</p>
          <p className="mt-1 text-xs font-semibold text-zinc-800">
            {dateFormatter.format(endDate)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-zinc-100 pt-5">
        <div>
          <p className="text-xs text-zinc-400">Estimated media total</p>
          <p className="mt-1 text-xl font-semibold text-zinc-950">
            {currencyFormatter.format(estimatedTotal)}
          </p>
        </div>
        <p className="text-right text-xs text-zinc-500">
          {durationWeeks} {durationWeeks === 1 ? 'week' : 'weeks'}
        </p>
      </div>

      <div className="mt-4">
        <ReserveButton isAvailable={isAvailable} />
      </div>

      <div className="mt-5 rounded-xl bg-zinc-50 p-4">
        <p className="text-sm font-semibold text-zinc-900">Need help choosing?</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Our team can help with placement, timing, and campaign planning.
        </p>
        <Link
          href="/#contact"
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
        >
          Contact assistance
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}
