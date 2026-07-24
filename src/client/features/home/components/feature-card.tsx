'use client';

import { motion } from 'motion/react';
import { fadeUp } from '@/client/features/home/lib/animations';
import type { FeatureItem } from '@/client/features/home/home.types';

export function FeatureCard({ feature }: { feature: FeatureItem }) {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-lg"
    >
      <motion.span
        whileHover={{ rotate: -6, scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"
      >
        <Icon className="h-7 w-7" aria-hidden />
      </motion.span>
      <h3 className="text-lg font-semibold text-zinc-900">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-zinc-500">{feature.description}</p>
    </motion.div>
  );
}
