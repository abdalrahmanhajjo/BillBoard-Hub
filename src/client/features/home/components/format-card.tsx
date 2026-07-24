'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { fadeUp } from '@/client/features/home/lib/animations';
import type { BillboardFormat } from '@/client/features/home/home.types';

export function FormatCard({ format }: { format: BillboardFormat }) {
  const Icon = format.icon;

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2 }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:border-blue-200 hover:shadow-lg"
    >
      <div
        className={`flex aspect-4/3 items-center justify-center overflow-hidden bg-gradient-to-br ${format.gradient}`}
      >
        <Icon
          className="h-12 w-12 text-zinc-700 transition-transform duration-300 group-hover:scale-110"
          aria-hidden
        />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-6">
        <h3 className="text-lg font-semibold text-zinc-900">{format.title}</h3>
        <p className="text-sm leading-relaxed text-zinc-500">{format.description}</p>
        <Link
          href={format.href}
          className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          View Options
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </motion.div>
  );
}
