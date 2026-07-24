'use client';

import Link from 'next/link';
import { MapPin, PlayCircle, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { Input } from '@/client/ui/components/ui/input';
import { Button } from '@/client/ui/components/ui/button';
import { Container } from '@/client/features/home/components/container';
import { MapPanel } from '@/client/features/home/components/map-panel';
import { fadeUp, scaleIn, staggerContainer } from '@/client/features/home/lib/animations';
import { heroContent } from '@/client/features/home/data/homepage';
import type { HomeStats, MarketOverviewEntry } from '@/client/features/home/home.types';

type HeroProps = {
  marketOverview: MarketOverviewEntry[];
  stats: HomeStats;
};

export function Hero({ marketOverview, stats }: HeroProps) {
  return (
    <section className="border-b border-zinc-100 bg-gradient-to-b from-white to-zinc-50/60">
      <Container className="flex items-center py-16 lg:min-h-[calc(100svh-5rem)] lg:py-24">
        <div className="grid w-full items-center gap-14 lg:grid-cols-2 lg:gap-16 xl:gap-24">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.h1
              variants={fadeUp}
              className="text-5xl font-bold tracking-tight text-balance text-zinc-900 sm:text-6xl lg:text-7xl lg:leading-[1.05]"
            >
              {heroContent.headline}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600 sm:text-xl"
            >
              {heroContent.subheadline}
            </motion.p>

            <motion.form
              variants={fadeUp}
              action="/billboards"
              method="get"
              className="mt-8 flex w-full max-w-xl items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100"
            >
              <label htmlFor="hero-search" className="sr-only">
                Search location
              </label>
              <span className="pl-2.5 text-zinc-400">
                <MapPin className="h-5 w-5" aria-hidden />
              </span>
              <Input
                id="hero-search"
                name="q"
                type="search"
                placeholder={heroContent.searchPlaceholder}
                className="h-11 flex-1 border-transparent bg-transparent text-base shadow-none focus-visible:ring-0"
              />
              <Button
                type="submit"
                className="h-11 gap-1.5 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Search className="h-4 w-4" aria-hidden />
                Search
              </Button>
            </motion.form>

            <motion.div variants={fadeUp} className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href={heroContent.primaryCta.href}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                {heroContent.primaryCta.label}
              </Link>
              <Link
                href={heroContent.secondaryCta.href}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-7 py-3.5 text-base font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
              >
                <PlayCircle className="h-5 w-5" aria-hidden />
                {heroContent.secondaryCta.label}
              </Link>
            </motion.div>

            <motion.ul
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3"
            >
              {heroContent.chips.map(({ label, icon: Icon }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 text-[15px] text-zinc-500"
                >
                  <Icon className="h-5 w-5 text-blue-600" aria-hidden />
                  {label}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            transition={{ delay: 0.15 }}
          >
            <MapPanel marketOverview={marketOverview} stats={stats} />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
