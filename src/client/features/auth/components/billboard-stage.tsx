'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, MapPin, MonitorPlay, Ruler } from 'lucide-react';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import type { PublicBillboard } from '@/shared/types/billboard';
import { cn } from '@/client/ui/lib/utils';

type BillboardStageProps = {
  /** Real catalogue inventory; may be empty when the database is unreachable. */
  boards: PublicBillboard[];
};

const SLIDE_DURATION_MS = 7_000;

const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function BillboardStage({ boards }: BillboardStageProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Nothing to rotate through with a single board, and auto-advance is
    // decorative — leave it still for anyone who asked for less motion.
    if (boards.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % boards.length);
    }, SLIDE_DURATION_MS);

    return () => window.clearInterval(timer);
  }, [activeIndex, boards.length]);

  const activeBoard = boards[activeIndex];

  return (
    <aside className="relative hidden overflow-hidden bg-[#050914] lg:flex lg:flex-col">
      {boards.map((board, index) => (
        <div
          key={board.id}
          aria-hidden={index !== activeIndex}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000 ease-out',
            index === activeIndex ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Image
            src={board.images[0]}
            alt={`${board.name} — ${board.location.address}, ${board.location.city}`}
            fill
            // The panel only exists from the lg breakpoint up.
            sizes="(min-width: 1024px) 55vw, 0px"
            className="auth-photo-drift object-cover"
            priority={index === 0}
          />
        </div>
      ))}

      {boards.length === 0 ? (
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-br from-blue-700 via-indigo-700 to-cyan-600 opacity-80"
        />
      ) : null}

      {/* Scrims: the photographs are bright skies and pale concrete, so text
          needs a floor to stay legible. Weighted to the two edges that carry
          copy, leaving the middle of the photograph close to untouched. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-[#03060f]/70 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-[#03060f] via-[#03060f]/75 to-transparent"
      />

      <div className="relative z-10 px-10 pt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-lg text-white focus-visible:ring-3 focus-visible:ring-white/40 focus-visible:outline-none"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
            <MonitorPlay className="size-4" aria-hidden />
          </span>
          <span className="text-base font-semibold tracking-tight">Boardly</span>
        </Link>
      </div>

      {activeBoard ? (
        <div className="relative z-10 mt-auto p-10">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white ring-1 ring-white/25 backdrop-blur-sm">
              {activeBoard.type === BILLBOARD_TYPES.DIGITAL ? (
                <>
                  <span className="size-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
                  Digital
                </>
              ) : (
                'Static'
              )}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80">
              <MapPin className="size-3.5" aria-hidden />
              {activeBoard.location.city}, {activeBoard.location.country}
            </span>
          </div>

          <p className="mt-3.5 text-2xl leading-tight font-semibold text-balance text-white">
            {activeBoard.name}
          </p>

          {activeBoard.description ? (
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/75">
              {activeBoard.description}
            </p>
          ) : null}

          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
            {activeBoard.trafficCount ? (
              <div>
                <dt className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-white/60 uppercase">
                  <Eye className="size-3.5" aria-hidden />
                  Monthly traffic
                </dt>
                <dd className="mt-1 text-lg font-semibold text-white">
                  {compactNumber.format(activeBoard.trafficCount)}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-white/60 uppercase">
                <Ruler className="size-3.5" aria-hidden />
                Size
              </dt>
              <dd className="mt-1 text-lg font-semibold text-white">
                {activeBoard.dimensions.width} × {activeBoard.dimensions.height}
                {activeBoard.dimensions.unit}
              </dd>
            </div>
          </dl>

          {boards.length > 1 ? (
            <div className="mt-7 flex items-center gap-3">
              <div className="flex items-center gap-2">
                {boards.map((board, index) => (
                  <button
                    key={board.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show ${board.name}`}
                    aria-current={index === activeIndex}
                    className={cn(
                      'h-1.5 rounded-full transition-all focus-visible:ring-3 focus-visible:ring-white/40 focus-visible:outline-none',
                      index === activeIndex
                        ? 'w-7 bg-white'
                        : 'w-1.5 bg-white/35 hover:bg-white/60',
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-white/55">
                {activeIndex + 1} / {boards.length} live locations
              </span>
            </div>
          ) : null}
        </div>
      ) : (
        // Catalogue unavailable: keep the panel branded rather than showing an
        // empty frame or inventory that does not exist.
        <div className="relative z-10 mt-auto p-10">
          <p className="text-2xl leading-tight font-semibold text-balance text-white">
            Billboard campaigns, booked end to end.
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/75">
            Reserve verified placements, upload creatives, and follow every campaign from approval
            to launch.
          </p>
        </div>
      )}
    </aside>
  );
}
