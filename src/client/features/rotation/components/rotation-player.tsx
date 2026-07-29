'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { AD_CREATIVE_TYPES as CREATIVE_TYPES } from '@/shared/constants/ad-creative';
import type { RotationItem } from '@/shared/types/rotation';

type RotationPlayerProps = {
  items: RotationItem[];
  /** Fired once each time a creative starts playing (used to log impressions). */
  onItemStart?: (item: RotationItem) => void;
  autoPlay?: boolean;
};

export function RotationPlayer({ items, onItemStart, autoPlay = true }: RotationPlayerProps) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const lastReported = useRef<number>(-1);

  const current = items[index];

  // Advance through items and drive the progress bar with a single timer. The
  // parent remounts this component (via `key`) when the rotation changes, so no
  // separate reset effect is needed. All state updates happen inside the timer
  // callback to avoid synchronous setState in the effect body.
  useEffect(() => {
    if (!isPlaying || items.length === 0 || !current) return;
    const durationMs = Math.max(1, current.durationSeconds) * 1000;
    const startedAt = Date.now();
    const id = setInterval(() => {
      const fraction = Math.min(1, (Date.now() - startedAt) / durationMs);
      setProgress(fraction);
      if (fraction >= 1) {
        clearInterval(id);
        setProgress(0);
        setIndex((prev) => (prev + 1) % items.length);
      }
    }, 150);
    return () => clearInterval(id);
  }, [index, isPlaying, items, current]);

  // Report each creative start exactly once (per play), for impressions.
  useEffect(() => {
    if (!isPlaying || items.length === 0 || !current) return;
    if (lastReported.current === index) return;
    lastReported.current = index;
    onItemStart?.(current);
  }, [index, isPlaying, items, current, onItemStart]);

  const goTo = (next: number) => {
    if (items.length === 0) return;
    lastReported.current = -1;
    setIndex(((next % items.length) + items.length) % items.length);
    setProgress(0);
  };

  if (items.length === 0 || !current) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-zinc-500">
        No creatives in this rotation.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        {current.type === CREATIVE_TYPES.VIDEO ? (
          <video
            key={current.creativeId}
            src={current.assetUrl}
            className="h-full w-full object-contain"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current.creativeId}
            src={current.assetUrl}
            alt={current.name}
            className="h-full w-full object-contain"
          />
        )}

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 py-2 text-xs text-white/80">
          <span className="rounded-full bg-black/50 px-2 py-0.5 font-medium">
            {index + 1} / {items.length}
          </span>
          <span className="truncate rounded-full bg-black/50 px-2 py-0.5 font-medium">
            {current.name}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/15">
          <div
            className="h-full bg-emerald-400 transition-[width] duration-150 ease-linear"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Previous"
          className="rounded-md border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50"
        >
          <SkipBack className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setIsPlaying((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="Next"
          className="rounded-md border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50"
        >
          <SkipForward className="size-4" />
        </button>
      </div>

      <ol className="divide-y divide-zinc-100 overflow-hidden rounded-md border border-zinc-200">
        {items.map((item, itemIndex) => (
          <li
            key={item.creativeId}
            className={`flex items-center gap-3 px-3 py-2 text-sm ${
              itemIndex === index ? 'bg-emerald-50' : 'bg-white'
            }`}
          >
            <span className="w-5 text-center text-xs font-semibold text-zinc-400">
              {itemIndex + 1}
            </span>
            <span className="min-w-0 flex-1 truncate">{item.name}</span>
            <span className="text-xs text-zinc-500">{item.durationSeconds}s</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
