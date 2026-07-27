'use client';

import { useEffect, useState } from 'react';
import { Monitor, Radio, Repeat, Sparkles, Sun, Timer, Zap } from 'lucide-react';
import type { PublicBillboard, PublicDigitalSpec, Resolution } from '@/shared/types/billboard';

const numberFormatter = new Intl.NumberFormat('en-US');

/**
 * Representative display configuration used when a digital billboard has no
 * published spec yet. Grounded in the billboard's real dimensions (orientation
 * drives the resolution) so the panel always reads as a real screen rather than
 * a "coming soon" placeholder.
 */
function buildFallbackSpec(billboard: PublicBillboard): PublicDigitalSpec {
  const { width, height } = billboard.dimensions;
  let resolution: Resolution;
  if (width > height) {
    resolution = { width: 1920, height: 1080 };
  } else if (height > width) {
    resolution = { width: 1080, height: 1920 };
  } else {
    resolution = { width: 1440, height: 1440 };
  }

  return {
    resolution,
    brightness: 6000,
    slotDurationSeconds: 10,
    rotatingAdsCount: 6,
  };
}

/**
 * Distinct, live "digital screen" experience for the public details page.
 * Renders the digital spec (resolution, brightness, slot duration, rotating
 * ads) plus derived, advertiser-facing metrics on a dark, screen-like panel,
 * with an animated rotation loop so a digital billboard reads very differently
 * from a static one. Falls back to a representative spec when none is published.
 */
export function DigitalSpecShowcase({
  spec,
  billboard,
}: {
  spec: PublicDigitalSpec | null;
  billboard: PublicBillboard;
}) {
  const effectiveSpec = spec ?? buildFallbackSpec(billboard);
  const isRepresentative = spec === null;

  const { resolution, brightness, slotDurationSeconds, rotatingAdsCount } = effectiveSpec;
  const megapixels = (resolution.width * resolution.height) / 1_000_000;
  const loopSeconds = slotDurationSeconds * rotatingAdsCount;
  const spotsPerHour = Math.max(1, Math.floor(3600 / loopSeconds));
  const shareOfScreen = Math.round(100 / rotatingAdsCount);

  const slotCount = Math.min(rotatingAdsCount, 12);
  const previewIntervalMs = Math.max(1200, Math.min(slotDurationSeconds, 3) * 1000);
  const [activeSlot, setActiveSlot] = useState(0);

  useEffect(() => {
    if (slotCount <= 1) return;
    const id = setInterval(() => {
      setActiveSlot((current) => (current + 1) % slotCount);
    }, previewIntervalMs);
    return () => clearInterval(id);
  }, [slotCount, previewIntervalMs]);

  const specs = [
    {
      icon: Monitor,
      label: 'Resolution',
      value: `${numberFormatter.format(resolution.width)} × ${numberFormatter.format(resolution.height)} px`,
      sub: `${megapixels.toFixed(1)} MP`,
    },
    {
      icon: Sun,
      label: 'Brightness',
      value: `${numberFormatter.format(brightness)} nits`,
      sub: brightness >= 5000 ? 'Sunlight-readable' : 'Indoor / dusk',
    },
    { icon: Timer, label: 'Ad slot duration', value: `${slotDurationSeconds}s`, sub: 'per play' },
    {
      icon: Repeat,
      label: 'Rotating ads',
      value: `${rotatingAdsCount}`,
      sub: 'advertisers in loop',
    },
  ];

  const highlights = [
    { icon: Repeat, label: 'Full loop', value: `${loopSeconds}s` },
    { icon: Zap, label: 'Your spots / hour', value: `~${spotsPerHour}` },
    { icon: Sparkles, label: 'Share of screen', value: `${shareOfScreen}%` },
  ];

  const activeLabel = activeSlot === 0 ? 'Your ad' : `Ad ${activeSlot + 1}`;

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-white">
      <div className="relative border-b border-zinc-800 p-6 sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(59,130,246,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.15) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_0_40px_rgba(37,99,235,.6)]">
            <Monitor className="size-5" aria-hidden />
          </span>
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.16em] text-blue-300 uppercase">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live digital screen
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
              Digital screen specifications
            </h2>
          </div>
        </div>
        <p className="relative mt-3 max-w-xl text-sm text-zinc-400">
          Programmatic LED display — your creative rotates with other advertisers on a timed loop.
        </p>
      </div>

      <div className="grid gap-px bg-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
        {specs.map((item) => (
          <div key={item.label} className="bg-zinc-950 p-6">
            <item.icon className="size-5 text-blue-400" aria-hidden />
            <p className="mt-4 text-2xl font-semibold tracking-[-0.03em] tabular-nums">
              {item.value}
            </p>
            <p className="mt-1 text-xs font-medium text-zinc-300">{item.label}</p>
            <p className="text-[11px] text-zinc-500">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 border-t border-zinc-800 p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] text-zinc-400 uppercase">
              <Radio className="size-3.5 text-emerald-400" aria-hidden />
              Live rotation
            </p>
            <p className="text-xs font-medium text-zinc-400 tabular-nums">
              Now showing{' '}
              <span className="font-semibold text-white">
                {activeSlot + 1}/{slotCount}
              </span>
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: slotCount }).map((_, index) => {
              const isActive = index === activeSlot;
              const isYours = index === 0;
              return (
                <span
                  key={index}
                  className={`flex h-10 min-w-16 flex-1 items-center justify-center rounded-lg border text-xs font-semibold transition-all duration-500 ${
                    isActive
                      ? 'border-blue-400 bg-blue-600 text-white shadow-[0_0_22px_rgba(37,99,235,.65)]'
                      : isYours
                        ? 'border-blue-500/50 bg-blue-500/10 text-blue-200'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                  }`}
                >
                  {isYours ? 'Your ad' : `Ad ${index + 1}`}
                </span>
              );
            })}
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              key={activeSlot}
              className="h-full rounded-full bg-emerald-400"
              style={{ animation: `dss-slot-progress ${previewIntervalMs}ms linear forwards` }}
            />
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Currently on <span className="font-medium text-zinc-300">{activeLabel}</span> · each ad
            shows for {slotDurationSeconds}s · a full loop completes every {loopSeconds}s.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center"
            >
              <item.icon className="mx-auto size-4 text-blue-400" aria-hidden />
              <p className="mt-2 text-lg font-semibold tabular-nums">{item.value}</p>
              <p className="mt-0.5 text-[11px] text-zinc-400">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {isRepresentative ? (
        <p className="border-t border-zinc-800 px-6 py-3 text-[11px] text-zinc-500 sm:px-10">
          Representative configuration for this screen class — exact display specs are confirmed
          with your reservation.
        </p>
      ) : null}

      <style>{`@keyframes dss-slot-progress { from { width: 0% } to { width: 100% } }`}</style>
    </section>
  );
}
