'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ImageIcon, MapPin, MoveUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import type { PublicBillboard } from '@/shared/types/billboard';
import { Container } from '@/client/features/home/components/container';
import { formatMonthlyPrice } from '@/client/features/public-catalog/utils/format-price';

const INVENTORY_LIMIT = 4;
const ease = [0.16, 1, 0.3, 1] as const;
const fallbackImages = [
  '/images/inventory/featured-coastal-billboard.png',
  '/images/inventory/featured-digital-intersection.png',
  '/images/inventory/featured-rooftop-billboard.png',
  '/images/inventory/featured-street-display.png',
];

type InventoryShowcaseProps = {
  billboards: PublicBillboard[];
};

function typeLabel(type: PublicBillboard['type']): string {
  return type === BILLBOARD_TYPES.DIGITAL ? 'Digital screen' : 'Static billboard';
}

function InventoryFeature({ billboard, index }: { billboard: PublicBillboard; index: number }) {
  const [imageFailed, setImageFailed] = useState(false);
  const reduceMotion = useReducedMotion();
  const source = billboard.images[0] && !imageFailed ? billboard.images[0] : fallbackImages[index];
  const { width, height, unit } = billboard.dimensions;

  const layouts = [
    'min-h-[500px] sm:min-h-[560px] md:col-span-7 md:row-span-2 lg:min-h-[680px]',
    'min-h-[330px] sm:min-h-[360px] md:col-span-5 lg:min-h-0',
    'min-h-[330px] sm:min-h-[360px] md:col-span-3 lg:min-h-0',
    'min-h-[330px] sm:min-h-[360px] md:col-span-2 lg:min-h-0',
  ];

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: reduceMotion ? 0 : 34, scale: reduceMotion ? 1 : 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.7, ease },
        },
      }}
      className={`group relative overflow-hidden rounded-[24px] bg-zinc-900 sm:rounded-[28px] ${layouts[index]}`}
    >
      <Link
        href={`/billboards/${billboard.id}`}
        className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        aria-label={`View ${billboard.name}`}
      >
        {source ? (
          <Image
            src={source}
            alt={billboard.name}
            fill
            sizes={
              index === 0 ? '(min-width: 768px) 58vw, 100vw' : '(min-width: 768px) 40vw, 100vw'
            }
            onError={() => setImageFailed(true)}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-zinc-800 text-zinc-600">
            <ImageIcon className="size-8" aria-hidden />
          </div>
        )}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,11,.04)_20%,rgba(9,9,11,.88)_100%)] transition-opacity duration-500 group-hover:opacity-90" />

        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
          <div className="mb-4 flex items-center gap-3 text-xs text-white/72">
            <span>{typeLabel(billboard.type)}</span>
            <span className="h-px w-5 bg-white/35" aria-hidden />
            <span>
              {width} × {height} {unit}
            </span>
          </div>

          <div className="flex items-end justify-between gap-5">
            <div className="min-w-0">
              <h3
                className={`font-semibold tracking-[-0.04em] text-balance ${
                  index === 0 ? 'text-3xl sm:text-5xl' : 'text-2xl'
                }`}
              >
                {billboard.name}
              </h3>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-white/72">
                <MapPin className="size-4 shrink-0" aria-hidden />
                <span className="truncate">
                  {billboard.location.city}, {billboard.location.country}
                </span>
              </p>
              <p className="mt-5 text-sm text-white/65">
                From{' '}
                <strong className="text-base font-semibold text-white">
                  {formatMonthlyPrice(billboard.monthlyPrice)}
                </strong>
              </p>
            </div>

            <motion.span
              whileHover={reduceMotion ? undefined : { rotate: 6, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-zinc-950"
            >
              <MoveUpRight className="size-5" aria-hidden />
            </motion.span>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs font-medium">
            <span
              className={`size-2 rounded-full ${
                billboard.isAvailable ? 'bg-emerald-400' : 'bg-zinc-400'
              }`}
              aria-hidden
            />
            {billboard.isAvailable ? 'Available now' : 'Currently unavailable'}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function InventoryShowcase({ billboards }: InventoryShowcaseProps) {
  const reduceMotion = useReducedMotion();
  const topBillboards = useMemo(
    () =>
      [...billboards]
        .sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable))
        .slice(0, INVENTORY_LIMIT),
    [billboards],
  );

  return (
    <section className="bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <Container className="py-20 sm:py-24 lg:py-36">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, ease }}
          className="max-w-4xl"
        >
          <h2 className="max-w-3xl text-4xl leading-[0.96] font-semibold tracking-tighter text-balance sm:text-5xl lg:text-7xl">
            Four placements worth seeing first.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            A focused edit of standout inventory, selected for location, visibility, and campaign
            potential.
          </p>
        </motion.div>

        {topBillboards.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: reduceMotion ? 0 : 0.1, delayChildren: 0.08 },
              },
            }}
            className="mt-12 grid gap-3 sm:mt-14 sm:gap-4 md:grid-cols-12 md:grid-rows-2 lg:mt-20 lg:h-[680px]"
          >
            {topBillboards.map((billboard, index) => (
              <InventoryFeature key={billboard.id} billboard={billboard} index={index} />
            ))}
          </motion.div>
        ) : (
          <div className="mt-14 rounded-[28px] border border-dashed border-zinc-300 px-6 py-20 text-center dark:border-zinc-700">
            <ImageIcon className="mx-auto size-8 text-zinc-400" aria-hidden />
            <p className="mt-4 font-semibold">Featured inventory is being prepared.</p>
            <p className="mt-2 text-sm text-zinc-500">
              Browse the full marketplace for currently published billboards.
            </p>
          </div>
        )}

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.55, ease }}
          className="mt-12"
        >
          <Link
            href="/billboards"
            className="group inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold whitespace-nowrap text-white transition-transform hover:scale-[1.025] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 active:scale-[0.98] sm:w-auto"
          >
            Browse all inventory
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
