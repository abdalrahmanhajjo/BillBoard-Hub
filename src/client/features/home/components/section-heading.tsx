'use client';

import { motion } from 'motion/react';
import { cn } from '@/client/ui/lib/utils';
import { fadeUp, staggerContainer, viewportOnce } from '@/client/features/home/lib/animations';

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

/** Consistent, large section title + subtitle with a staggered scroll reveal. */
export function SectionHeading({ title, subtitle, className }: SectionHeadingProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={cn('mx-auto max-w-3xl text-center', className)}
    >
      <motion.h2
        variants={fadeUp}
        className="text-3xl font-bold tracking-tight text-balance text-zinc-900 sm:text-4xl lg:text-5xl"
      >
        {title}
      </motion.h2>
      {subtitle ? (
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-2xl text-base text-pretty text-zinc-600 lg:text-lg"
        >
          {subtitle}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
