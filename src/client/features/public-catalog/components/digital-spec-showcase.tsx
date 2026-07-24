import { Monitor, Repeat, Sparkles, Sun, Timer, Zap } from 'lucide-react';
import type { PublicDigitalSpec } from '@/shared/types/billboard';

const numberFormatter = new Intl.NumberFormat('en-US');

/**
 * Distinct "digital screen" experience for the public details page. Renders the
 * public digital spec (resolution, brightness, slot duration, rotating ads) plus
 * a few derived, advertiser-facing metrics on a dark, screen-like panel so a
 * digital billboard reads very differently from a static one.
 */
export function DigitalSpecShowcase({ spec }: { spec: PublicDigitalSpec | null }) {
  if (!spec) {
    return (
      <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-white sm:p-10">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-blue-600/20 text-blue-300">
            <Monitor className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-blue-300 uppercase">
              Digital LED screen
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">
              Screen specifications coming soon
            </h2>
          </div>
        </div>
        <p className="mt-4 max-w-xl text-sm text-zinc-400">
          This is a digital screen. Detailed display specifications will be published shortly —
          contact the team for the current capabilities.
        </p>
      </section>
    );
  }

  const { resolution, brightness, slotDurationSeconds, rotatingAdsCount } = spec;
  const megapixels = (resolution.width * resolution.height) / 1_000_000;
  const loopSeconds = slotDurationSeconds * rotatingAdsCount;
  const spotsPerHour = Math.max(1, Math.floor(3600 / loopSeconds));
  const shareOfScreen = Math.round(100 / rotatingAdsCount);

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
          <p className="text-xs font-semibold tracking-[0.14em] text-zinc-400 uppercase">
            Rotation preview
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: Math.min(rotatingAdsCount, 12) }).map((_, index) => (
              <span
                key={index}
                className={`flex h-10 min-w-16 flex-1 items-center justify-center rounded-lg border text-xs font-semibold ${
                  index === 0
                    ? 'border-blue-500 bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,.5)]'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                }`}
              >
                {index === 0 ? 'Your ad' : `Ad ${index + 1}`}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Each ad shows for {slotDurationSeconds}s · a full loop completes every {loopSeconds}s.
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
    </section>
  );
}
