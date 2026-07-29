import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ImageIcon, MapPin, Ruler, Users } from 'lucide-react';
import type { PublicBillboard } from '@/shared/types/billboard';
import { formatMonthlyPrice } from '@/client/features/public-catalog/utils/format-price';
import { Card } from '@/client/ui/components/ui/card';

const CARD_IMAGE_SIZES = '(min-width: 1280px) 28vw, (min-width: 640px) 50vw, 100vw';

function formatTraffic(value?: number): string {
  if (!value) return 'Not listed';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M+`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K+`;
  return value.toLocaleString();
}

export function BillboardCard({ billboard }: { billboard: PublicBillboard }) {
  const coverImage = billboard.images[0];
  const { width, height, unit } = billboard.dimensions;

  return (
    <Card className="group grid min-h-[224px] grid-cols-[43%_57%] gap-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-0 ring-0 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_18px_45px_rgba(24,24,27,.09)] sm:flex sm:h-full sm:min-h-0 sm:flex-col">
      <Link
        href={`/billboards/${billboard.id}`}
        className="relative h-full min-h-[224px] w-full overflow-hidden bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset sm:aspect-[16/10] sm:h-auto sm:min-h-0"
        aria-label={`View ${billboard.name}`}
      >
        {coverImage ? (
          <Image
            src={coverImage}
            alt={billboard.name}
            fill
            sizes={CARD_IMAGE_SIZES}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-zinc-400">
            <ImageIcon className="size-8" aria-hidden />
            <span className="sr-only">No image available</span>
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start p-2 sm:p-3">
          <span className="rounded-lg bg-white/95 px-2 py-1 text-[10px] font-semibold text-zinc-800 capitalize shadow-sm backdrop-blur sm:px-2.5 sm:text-xs">
            {billboard.type}
          </span>
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-5">
        <div>
          <Link
            href={`/billboards/${billboard.id}`}
            className="line-clamp-2 text-[15px] leading-5 font-semibold tracking-[-0.02em] text-zinc-950 transition-colors group-hover:text-blue-700 sm:text-lg sm:leading-normal"
          >
            {billboard.name}
          </Link>
          <p className="mt-1.5 flex min-w-0 items-center gap-1 text-xs text-zinc-500 sm:mt-2 sm:gap-1.5 sm:text-sm">
            <MapPin className="size-3.5 shrink-0 sm:size-4" aria-hidden />
            <span className="truncate">
              {billboard.location.address || billboard.location.city}, {billboard.location.city}
            </span>
          </p>
        </div>

        <div className="mt-3 space-y-2 border-y border-zinc-100 py-3 sm:mt-5 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0 sm:py-4">
          <div className="flex items-center gap-2">
            <Ruler className="size-4 shrink-0 text-zinc-400" aria-hidden />
            <div>
              <p className="text-xs font-semibold text-zinc-800 sm:text-sm">
                {width} × {height} {unit}
              </p>
              <p className="mt-0.5 hidden text-[11px] text-zinc-400 sm:block">Dimensions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-4 shrink-0 text-zinc-400" aria-hidden />
            <div>
              <p className="text-xs font-semibold text-zinc-800 sm:text-sm">
                {formatTraffic(billboard.trafficCount)}
              </p>
              <p className="mt-0.5 hidden text-[11px] text-zinc-400 sm:block">Monthly traffic</p>
            </div>
          </div>
        </div>

        <div className="mt-auto flex flex-col items-start gap-2 pt-3 sm:flex-row sm:items-end sm:justify-between sm:gap-3 sm:pt-5">
          <div>
            <p className="text-sm font-semibold tracking-tight text-blue-600 sm:text-lg sm:text-zinc-950">
              {formatMonthlyPrice(billboard.monthlyPrice)}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold sm:px-2.5 sm:text-xs ${
              billboard.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                billboard.isAvailable ? 'bg-emerald-500' : 'bg-zinc-400'
              }`}
              aria-hidden
            />
            {billboard.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        <Link
          href={`/billboards/${billboard.id}`}
          className="mt-4 hidden min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-800 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white sm:flex"
        >
          View details
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}
