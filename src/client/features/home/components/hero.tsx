'use client';

import Link from 'next/link';
import { MapPin, PlayCircle, Search } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Input } from '@/client/ui/components/ui/input';
import { Container } from '@/client/features/home/components/container';
import { HeroCollage } from '@/client/features/home/components/hero-collage';
import { HomeIcon } from '@/client/features/home/components/home-icon';
import {
  fadeUp,
  heroLine,
  heroLineContainer,
  staggerContainer,
} from '@/client/features/home/lib/animations';
import type {
  HeroContent,
  HomeStats,
  MarketOverviewEntry,
} from '@/client/features/home/home.types';

type HeroProps = {
  marketOverview: MarketOverviewEntry[];
  stats: HomeStats;
  content: HeroContent;
};

export function Hero({ stats, content }: HeroProps) {
  const reduceMotion = useReducedMotion();
  const words = content.headline.split(' ');
  const accentIndex = words.length - 1;

  return (
    <section className="relative overflow-hidden">
      {/* Hero-local ambient background: a drifting grid for depth, a slow conic
          sheen behind the headline, and a warm top light. Sits above the page
          atmosphere but below the content. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-grid absolute inset-0" />
        <div className="hero-sheen absolute -top-1/3 left-1/2 h-[120vh] w-[120vh] -translate-x-1/2 rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(37,99,235,0.10),transparent_35%,rgba(14,165,233,0.08),transparent_70%)] opacity-70 blur-2xl" />
        <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.85),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,#f7f9fc,transparent)]" />
      </div>

      <Container className="flex items-center py-14 sm:py-20 lg:min-h-[calc(100svh-5rem)] lg:py-20">
        <div className="grid w-full min-w-0 items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 xl:gap-20">
          {/* Copy column */}
          <div className="min-w-0">
            <motion.h1
              variants={reduceMotion ? undefined : heroLineContainer}
              initial={reduceMotion ? false : 'hidden'}
              animate="visible"
              className="max-w-[15ch] text-[clamp(2.6rem,8.5vw,4.75rem)] leading-[0.98] font-bold tracking-[-0.04em] text-zinc-950"
            >
              {words.map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className="inline-flex overflow-hidden pb-[0.12em] align-bottom"
                >
                  <motion.span
                    variants={reduceMotion ? undefined : heroLine}
                    className={index === accentIndex ? 'inline-block italic' : 'inline-block'}
                  >
                    {word}
                    {index < words.length - 1 ? ' ' : ''}
                  </motion.span>
                </span>
              ))}
            </motion.h1>

            <motion.div
              initial={reduceMotion ? false : 'hidden'}
              animate="visible"
              variants={staggerContainer}
              transition={{ delayChildren: 0.35 }}
            >
              <motion.p
                variants={fadeUp}
                className="mt-5 max-w-xl text-base leading-7 text-pretty text-zinc-600 sm:mt-6 sm:text-lg sm:leading-8"
              >
                {content.subheadline}
              </motion.p>

              <motion.form
                variants={fadeUp}
                action="/billboards"
                method="get"
                className="group mt-7 grid w-full max-w-xl grid-cols-[auto_1fr] items-center gap-1.5 rounded-2xl border border-zinc-200/90 bg-white/90 p-2 shadow-[0_18px_40px_-24px_rgba(30,64,175,0.35)] backdrop-blur-sm transition-all focus-within:border-blue-300 focus-within:shadow-[0_22px_50px_-22px_rgba(37,99,235,0.5)] focus-within:ring-4 focus-within:ring-blue-100 sm:mt-8 sm:grid-cols-[auto_1fr_auto] sm:gap-2"
              >
                <label htmlFor="hero-search" className="sr-only">
                  Search location
                </label>
                <span className="pl-2.5 text-zinc-400 transition-colors group-focus-within:text-blue-500">
                  <MapPin className="h-5 w-5" aria-hidden />
                </span>
                <Input
                  id="hero-search"
                  name="q"
                  type="search"
                  placeholder={content.searchPlaceholder}
                  className="h-11 min-w-0 border-transparent bg-transparent px-2 text-base shadow-none placeholder:text-zinc-500 focus-visible:ring-0"
                />
                <motion.button
                  type="submit"
                  whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  className="col-span-2 inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-colors hover:bg-blue-700 sm:col-span-1 sm:h-11 sm:w-auto"
                >
                  <Search className="h-4 w-4" aria-hidden />
                  Search
                </motion.button>
              </motion.form>

              <motion.div
                variants={fadeUp}
                className="mt-6 grid gap-3 sm:mt-7 sm:flex sm:flex-wrap sm:items-center"
              >
                <motion.div
                  whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  className="sm:w-auto"
                >
                  <Link
                    href={content.primaryCta.href}
                    className="group/cta relative inline-flex min-h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-zinc-950 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-zinc-950/20 transition-colors hover:bg-zinc-800 sm:w-auto"
                  >
                    <span className="relative z-10">{content.primaryCta.label}</span>
                    {!reduceMotion && (
                      <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent,rgba(255,255,255,0.22),transparent)] transition-transform duration-700 group-hover/cta:translate-x-full" />
                    )}
                  </Link>
                </motion.div>
                <Link
                  href={content.secondaryCta.href}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white/70 px-7 py-3.5 text-base font-semibold text-zinc-800 backdrop-blur-sm transition-colors hover:border-zinc-400 hover:bg-white sm:w-auto"
                >
                  <PlayCircle className="h-5 w-5 text-blue-600" aria-hidden />
                  {content.secondaryCta.label}
                </Link>
              </motion.div>

              <motion.ul
                variants={fadeUp}
                className="mt-8 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap sm:gap-x-7 sm:gap-y-2"
              >
                {content.chips.map(({ label, icon }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-2 text-[15px] text-zinc-600"
                  >
                    <HomeIcon name={icon} className="h-5 w-5 text-blue-600" aria-hidden />
                    {label}
                  </li>
                ))}
              </motion.ul>
            </motion.div>
          </div>

          {/* Live inventory showcase */}
          <div className="min-w-0">
            <HeroCollage stats={stats} />
          </div>
        </div>
      </Container>
    </section>
  );
}
