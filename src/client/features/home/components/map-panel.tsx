'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { LebanonMap } from '@/client/features/home/components/lebanon-map';
import { fadeUp, staggerContainer, viewportOnce } from '@/client/features/home/lib/animations';
import type { HomeStats, MarketOverviewEntry } from '@/client/features/home/home.types';

type MapPanelProps = {
  marketOverview: MarketOverviewEntry[];
  stats: HomeStats;
};

const float = {
  animate: { y: [0, -6, 0] },
  transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
};

export function MapPanel({ marketOverview, stats }: MapPanelProps) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-2xl shadow-zinc-900/10">
      <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr]">
        {/* Stylized map of Lebanon */}
        <div className="relative h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 sm:h-80">
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
              backgroundSize: '26px 26px',
            }}
            aria-hidden
          />
          <div className="absolute inset-0 p-3">
            <LebanonMap />
          </div>
          <motion.span
            animate={float.animate}
            transition={float.transition}
            className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live Inventory · Updated just now
          </motion.span>
        </div>

        {/* Market overview (data-bound) */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          className="flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4"
        >
          <p className="mb-3 text-sm font-semibold text-zinc-900">Market Overview</p>
          <ul className="space-y-2.5">
            {marketOverview.length > 0 ? (
              marketOverview.map((entry) => (
                <li
                  key={entry.city}
                  className="flex items-center justify-between gap-2 text-[13px]"
                >
                  <span className="truncate text-zinc-600">{entry.city}</span>
                  <span className="shrink-0 font-medium text-zinc-900">
                    {entry.count} {entry.count === 1 ? 'Screen' : 'Screens'}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-[13px] text-zinc-500">No inventory published yet.</li>
            )}
          </ul>
          <Link
            href="/billboards"
            className="mt-auto inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
          >
            View All Inventory
          </Link>
        </motion.div>
      </div>

      {/* Bottom stats strip */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mt-4 flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <div className="grid grid-cols-3 gap-4 sm:gap-7">
          <motion.div variants={fadeUp}>
            <p className="text-xl font-semibold text-zinc-900">{stats.placements}+</p>
            <p className="text-xs text-zinc-500">Placements</p>
          </motion.div>
          <motion.div variants={fadeUp}>
            <p className="text-xl font-semibold text-zinc-900">{stats.cities}</p>
            <p className="text-xs text-zinc-500">Cities</p>
          </motion.div>
          <motion.div variants={fadeUp}>
            <p className="inline-flex items-center gap-2 text-xl font-semibold text-zinc-900">
              <span className="relative flex h-2.5 w-2.5">
                <motion.span
                  className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
                  animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </p>
            <p className="text-xs text-zinc-500">Availability</p>
          </motion.div>
        </div>

        <motion.div
          variants={fadeUp}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="shrink-0"
        >
          <Link
            href="/billboards"
            className="group flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-colors hover:bg-blue-700"
          >
            View Marketplace
            <motion.span
              className="inline-flex"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight className="h-4 w-4" aria-hidden />
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
