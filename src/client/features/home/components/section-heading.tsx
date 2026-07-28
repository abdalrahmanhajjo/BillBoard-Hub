'use client';

import { motion, useReducedMotion } from 'motion/react';

const ease = [0.16, 1, 0.3, 1] as const;

type SectionHeadingProps = {
  title: string;
  subtitle: string;
};

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.65, ease }}
    >
      <p className="text-xs font-semibold tracking-[0.16em] text-blue-600 uppercase">{subtitle}</p>
      <h2 className="mt-5 max-w-4xl text-4xl leading-[0.96] font-semibold tracking-tighter text-balance sm:text-5xl lg:text-7xl">
        {title}
      </h2>
    </motion.div>
  );
}
