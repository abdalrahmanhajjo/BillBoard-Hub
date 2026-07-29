'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Radio } from 'lucide-react';
import { EASE_OUT } from '@/client/features/home/lib/animations';
import type { HomeStats } from '@/client/features/home/home.types';

type HeroCollageProps = {
  stats: HomeStats;
};

/* Real out-of-home advertising photography — the product Boardly sells, shown
   the way the reference campaigns show it: full-bleed, editorial, in situ.
   Self-hosted under /public/hero so the above-the-fold art loads instantly. */
const PHOTOS = {
  square: {
    src: '/hero/billboard-square.jpg',
    alt: 'Digital billboard tower lighting up a city square at night',
  },
  street: {
    src: '/hero/billboard-street.jpg',
    alt: 'Roadside billboard advertising beside moving city traffic',
  },
  highway: {
    src: '/hero/billboard-highway.jpg',
    alt: 'Illuminated billboard glowing red over an evening street',
  },
} as const;

const frameReveal = {
  hidden: { opacity: 0, y: 30, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export function HeroCollage({ stats }: HeroCollageProps) {
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;

  const float = (range: number, duration: number, delay = 0) =>
    animate
      ? {
          animate: { y: [0, -range, 0] },
          transition: { duration, repeat: Infinity, ease: 'easeInOut' as const, delay },
        }
      : {};

  return (
    <div className="relative mx-auto w-full max-w-[600px]">
      {/* Signature scalloped-petal clip — the shape the reference brand is known
          for, applied to the lead frame. */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <clipPath id="boardly-scallop" clipPathUnits="objectBoundingBox">
            <path d="M0.07,0 L0.93,0 Q1,0 1,0.07 L1,0.8 A0.1667,0.2 0 0 1 0.6667,0.8 A0.1667,0.2 0 0 1 0.3333,0.8 A0.1667,0.2 0 0 1 0,0.8 L0,0.07 Q0,0 0.07,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* soft brand glow */}
      <div
        aria-hidden
        className="absolute inset-[8%] rounded-[45%] bg-[radial-gradient(circle_at_50%_40%,rgba(37,99,235,0.22),rgba(14,165,233,0.1)_46%,transparent_72%)] blur-2xl"
      />

      <motion.div
        className="relative aspect-[10/11]"
        initial={animate ? 'hidden' : false}
        animate="visible"
        transition={{ staggerChildren: 0.14, delayChildren: 0.15 }}
      >
        {/* Secondary — daytime street ad, upper right */}
        <motion.figure
          variants={frameReveal}
          transition={{ duration: 0.85, ease: EASE_OUT }}
          className="absolute top-0 right-[1%] z-10 w-[41%]"
          style={{ rotate: '3deg' }}
        >
          <motion.div
            {...float(11, 7.5, 0.4)}
            className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] shadow-[0_24px_50px_-20px_rgba(15,23,42,0.4)] ring-1 ring-black/5"
          >
            <Image
              src={PHOTOS.street.src}
              alt={PHOTOS.street.alt}
              fill
              priority
              sizes="(max-width: 1024px) 40vw, 240px"
              className="object-cover"
            />
          </motion.div>
        </motion.figure>

        {/* Lead — the scalloped hero frame */}
        <motion.figure
          variants={frameReveal}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="absolute top-[5%] left-[3%] z-20 w-[55%]"
          style={{ rotate: '-2deg' }}
        >
          <motion.div
            {...float(16, 8.5)}
            style={{ filter: 'drop-shadow(0 30px 55px rgba(15,23,42,0.32))' }}
          >
            <div
              className="relative aspect-[3/4] overflow-hidden bg-zinc-900"
              style={{ clipPath: 'url(#boardly-scallop)' }}
            >
              <Image
                src={PHOTOS.square.src}
                alt={PHOTOS.square.alt}
                fill
                priority
                sizes="(max-width: 1024px) 55vw, 330px"
                className="object-cover"
              />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                  <span className="relative flex h-1.5 w-1.5">
                    {animate ? (
                      <motion.span
                        className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
                        animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                      />
                    ) : null}
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  LIVE
                </span>
              </div>
            </div>
          </motion.div>
        </motion.figure>

        {/* Tertiary — night highway ad, overlapping foreground */}
        <motion.figure
          variants={frameReveal}
          transition={{ duration: 0.85, ease: EASE_OUT }}
          className="absolute bottom-[2%] left-[24%] z-30 w-[58%]"
          style={{ rotate: '-1deg' }}
        >
          <motion.div
            {...float(13, 9, 0.7)}
            className="relative aspect-[16/11] overflow-hidden rounded-[1.6rem] shadow-[0_30px_60px_-18px_rgba(15,23,42,0.5)] ring-1 ring-black/5"
          >
            <Image
              src={PHOTOS.highway.src}
              alt={PHOTOS.highway.alt}
              fill
              priority
              sizes="(max-width: 1024px) 58vw, 340px"
              className="object-cover"
            />
          </motion.div>
        </motion.figure>
      </motion.div>

      {/* Grounding caption — real inventory numbers */}
      <motion.div
        className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-center text-[13px] text-zinc-600"
        initial={animate ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.8 }}
      >
        <span className="inline-flex items-center gap-1.5 font-medium text-zinc-800">
          <Radio className="h-4 w-4 text-emerald-500" aria-hidden />
          Live inventory
        </span>
        <span className="text-zinc-300" aria-hidden>
          •
        </span>
        <span>
          <strong className="font-semibold text-zinc-900">{stats.placements}+</strong> screens
        </span>
        <span className="text-zinc-300" aria-hidden>
          •
        </span>
        <span>
          <strong className="font-semibold text-zinc-900">{stats.cities}</strong>{' '}
          {stats.cities === 1 ? 'city' : 'cities'}
        </span>
        <span className="text-zinc-300" aria-hidden>
          •
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-blue-600">
          Book instantly
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </motion.div>
    </div>
  );
}
