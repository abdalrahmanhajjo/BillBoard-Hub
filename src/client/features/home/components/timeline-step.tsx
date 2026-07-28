'use client';

import { motion, useReducedMotion } from 'motion/react';
import { HomeIcon } from '@/client/features/home/components/home-icon';
import type { HowItWorksStep } from '@/client/features/home/home.types';

const ease = [0.16, 1, 0.3, 1] as const;

type TimelineStepProps = {
  step: HowItWorksStep;
  side: 'left' | 'right';
};

export function TimelineStep({ step, side }: TimelineStepProps) {
  const reduceMotion = useReducedMotion();
  const isLeft = side === 'left';

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease }}
      className={`group relative flex items-start gap-6 md:gap-0 ${
        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
    >
      {/* Dot indicator (mobile + desktop) */}
      <div
        aria-hidden
        className="absolute top-0 left-4 z-10 size-4 -translate-x-1/2 translate-y-2 rounded-full border-4 border-blue-500 bg-white md:left-1/2"
      />

      {/* Spacer column to keep content from overlapping the spine on desktop */}
      <div className="hidden w-1/2 md:block" />

      <div
        className={`relative ml-16 flex-1 md:ml-0 md:w-1/2 md:basis-1/2 ${
          isLeft ? 'md:pr-24 md:text-right' : 'md:pl-24'
        }`}
      >
        <div className={`inline-flex items-center gap-4 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
          <motion.span
            whileHover={reduceMotion ? undefined : { rotate: -6, scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white sm:size-14 dark:bg-blue-950 dark:text-blue-300"
          >
            <HomeIcon name={step.icon} className="size-6" aria-hidden />
          </motion.span>
          <span className="font-mono text-xs font-semibold text-blue-600">
            Step {String(step.number).padStart(2, '0')}
          </span>
        </div>

        <h3
          className={`mt-4 text-xl font-semibold tracking-tight sm:text-2xl ${isLeft ? 'md:text-right' : ''}`}
        >
          {step.title}
        </h3>
        <p
          className={`mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400 ${isLeft ? 'md:text-right' : ''}`}
        >
          {step.description}
        </p>
      </div>
    </motion.article>
  );
}
