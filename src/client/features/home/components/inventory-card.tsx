'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Heart, ImageIcon, MapPin } from 'lucide-react';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import type { PublicBillboard } from '@/shared/types/billboard';
import { Badge } from '@/client/ui/components/ui/badge';
import { formatMonthlyPrice } from '@/client/features/public-catalog/utils/format-price';
import { fadeUp } from '@/client/features/home/lib/animations';

const CARD_IMAGE_SIZES = '(min-width: 1280px) 20vw, (min-width: 640px) 45vw, 90vw';

function typeLabel(type: PublicBillboard['type']): string {
  return type === BILLBOARD_TYPES.DIGITAL ? 'Digital Screen' : 'Static Billboard';
}

export function InventoryCard({ billboard }: { billboard: PublicBillboard }) {
  const [favorite, setFavorite] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const coverImage = billboard.images[0];
  const { width, height, unit } = billboard.dimensions;

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      <motion.button
        type="button"
        onClick={() => setFavorite((value) => !value)}
        whileTap={{ scale: 0.8 }}
        aria-pressed={favorite}
        aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-sm transition-colors hover:text-rose-500"
      >
        <Heart
          className={`h-4.5 w-4.5 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`}
          aria-hidden
        />
      </motion.button>

      <Link href={`/billboards/${billboard.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100">
          {coverImage && !imageFailed ? (
            <Image
              src={coverImage}
              alt={billboard.name}
              fill
              sizes={CARD_IMAGE_SIZES}
              onError={() => setImageFailed(true)}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-300">
              <ImageIcon className="h-8 w-8" aria-hidden />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          <h3 className="text-lg font-semibold text-zinc-900">{billboard.name}</h3>
          <p className="text-sm text-zinc-500">
            {typeLabel(billboard.type)} · {width} × {height} {unit}
          </p>
          <p className="inline-flex items-center gap-1.5 text-sm text-zinc-500">
            <MapPin className="h-4 w-4" aria-hidden />
            {billboard.location.city}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2">
            <Badge variant={billboard.isAvailable ? 'success' : 'muted'} className="px-2.5 py-1">
              <span
                className={`h-1.5 w-1.5 rounded-full ${billboard.isAvailable ? 'bg-emerald-500' : 'bg-zinc-400'}`}
              />
              {billboard.isAvailable ? 'Available' : 'Unavailable'}
            </Badge>
            <span className="text-base font-semibold text-zinc-900">
              From {formatMonthlyPrice(billboard.monthlyPrice)}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
