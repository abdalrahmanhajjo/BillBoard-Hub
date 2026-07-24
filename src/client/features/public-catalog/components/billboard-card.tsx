import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon } from 'lucide-react';
import type { PublicBillboard } from '@/shared/types/billboard';
import { BillboardAvailabilityBadge } from '@/client/features/public-catalog/components/billboard-availability-badge';
import { formatMonthlyPrice } from '@/client/features/public-catalog/utils/format-price';

const CARD_IMAGE_SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw';

export function BillboardCard({ billboard }: { billboard: PublicBillboard }) {
  const coverImage = billboard.images[0];

  return (
    <Link
      href={`/billboards/${billboard.id}`}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
    >
      <div className="relative aspect-4/3 w-full bg-zinc-100">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={billboard.name}
            fill
            sizes={CARD_IMAGE_SIZES}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            <ImageIcon className="h-8 w-8" aria-hidden />
            <span className="sr-only">No image available</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <BillboardAvailabilityBadge isAvailable={billboard.isAvailable} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold tracking-tight text-zinc-900">{billboard.name}</h3>
          <span className="shrink-0 text-xs font-medium text-zinc-500 capitalize">
            {billboard.type}
          </span>
        </div>

        <p className="text-sm text-zinc-600">
          {billboard.location.city}, {billboard.location.country}
        </p>

        <p className="mt-auto pt-2 text-sm font-semibold text-zinc-900">
          {formatMonthlyPrice(billboard.monthlyPrice)}
        </p>
      </div>
    </Link>
  );
}
