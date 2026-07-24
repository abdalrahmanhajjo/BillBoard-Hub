'use client';

import { motion } from 'motion/react';
import { cn } from '@/client/ui/lib/utils';
import { EASE_OUT, viewportOnce } from '@/client/features/home/lib/animations';
import type { HowItWorksStep } from '@/client/features/home/home.types';

type TimelineStepProps = {
  step: HowItWorksStep;
  side: 'left' | 'right';
};

/** One node on the vertical timeline; content sits left or right of the spine. */
export function TimelineStep({ step, side }: TimelineStepProps) {
  const Icon = step.icon;
  const onLeft = side === 'left';

  return (
    <div className="relative md:grid md:grid-cols-2 md:items-center md:gap-20">
      {/* Node on the spine */}
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="absolute top-7 left-4 z-10 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-sm font-bold text-white shadow-md md:top-1/2 md:left-1/2 md:-translate-y-1/2"
      >
        {step.number}
      </motion.span>

      {/* Content card */}
      <motion.div
        initial={{ opacity: 0, x: onLeft ? -40 : 40, y: 16 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className={cn(
          'ml-12 md:ml-0',
          onLeft ? 'md:col-start-1 md:mr-20' : 'md:col-start-2 md:ml-20',
        )}
      >
        <div className="group rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-xl lg:p-10">
          <div className={cn('flex items-center gap-4', onLeft && 'md:flex-row-reverse')}>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-110">
              <Icon className="h-7 w-7" aria-hidden />
            </span>
            <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
              Step {step.number}
            </span>
          </div>
          <h3 className={cn('mt-6 text-xl font-semibold text-zinc-900', onLeft && 'md:text-right')}>
            {step.title}
          </h3>
          <p
            className={cn(
              'mt-2 text-base leading-relaxed text-zinc-600',
              onLeft && 'md:text-right',
            )}
          >
            {step.description}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
