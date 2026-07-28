'use client';

import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Container } from '@/client/features/home/components/container';
import { HomeIcon } from '@/client/features/home/components/home-icon';
import type { FeatureItem } from '@/client/features/home/home.types';

const ease = [0.16, 1, 0.3, 1] as const;

export function Features({ features }: { features: FeatureItem[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="features"
      className="scroll-mt-24 border-y border-zinc-200 bg-zinc-50 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
    >
      <Container className="py-20 sm:py-24 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, ease }}
          className="max-w-3xl"
        >
          <div className="mb-5 flex items-center gap-3 text-xs font-semibold tracking-[0.16em] text-blue-600 uppercase">
            <span className="h-px w-8 bg-blue-600" aria-hidden />
            Platform
          </div>
          <h2 className="text-4xl leading-[0.96] font-semibold tracking-tighter text-balance sm:text-5xl lg:text-6xl">
            Everything you need to run smarter campaigns.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Plan, launch, and measure every placement through one connected workflow.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-200 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-800">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, delay: reduceMotion ? 0 : index * 0.06, ease }}
              className="group relative flex flex-col bg-zinc-50 p-8 transition-colors duration-300 hover:bg-white sm:p-10 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-blue-600 transition-transform duration-300 group-hover:scale-x-100"
              />

              <div className="flex items-center justify-between">
                <motion.span
                  whileHover={reduceMotion ? undefined : { rotate: -6, scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="flex size-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-[0_12px_32px_rgba(24,24,27,.07)] transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white sm:size-14 dark:bg-zinc-900 dark:shadow-none"
                >
                  <HomeIcon name={feature.icon} className="size-6" aria-hidden />
                </motion.span>
                <span className="font-mono text-sm text-zinc-400 tabular-nums dark:text-zinc-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <h3 className="mt-7 text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>

              <ArrowUpRight
                aria-hidden
                className="mt-6 size-5 translate-y-1 text-zinc-400 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:text-blue-600 group-hover:opacity-100 dark:text-zinc-600"
              />
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}
