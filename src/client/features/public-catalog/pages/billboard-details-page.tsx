import Link from 'next/link';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import type { PublicBillboard, PublicDigitalSpec } from '@/shared/types/billboard';
import { BillboardAvailabilityBadge } from '@/client/features/public-catalog/components/billboard-availability-badge';
import { BillboardGallery } from '@/client/features/public-catalog/components/billboard-gallery';
import { BillboardDetailRow } from '@/client/features/public-catalog/components/billboard-detail-row';
import { DigitalSpecPanel } from '@/client/features/public-catalog/components/digital-spec-panel';
import { ReserveButton } from '@/client/features/public-catalog/components/reserve-button';
import { formatMonthlyPrice } from '@/client/features/public-catalog/utils/format-price';

const trafficFormatter = new Intl.NumberFormat('en-US');

type BillboardDetailsPageProps = {
  billboard: PublicBillboard;
  spec: PublicDigitalSpec | null;
};

export function BillboardDetailsPage({ billboard, spec }: BillboardDetailsPageProps) {
  const { location, dimensions } = billboard;
  const typeLabel = billboard.type[0].toUpperCase() + billboard.type.slice(1);
  const isDigital = billboard.type === BILLBOARD_TYPES.DIGITAL;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <Link href="/billboards" className="text-sm text-zinc-500 underline-offset-2 hover:underline">
        ← Back to billboards
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <BillboardGallery images={billboard.images} name={billboard.name} />

        <div className="space-y-6">
          <header className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500">{typeLabel}</span>
              <BillboardAvailabilityBadge isAvailable={billboard.isAvailable} />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{billboard.name}</h1>
            <p className="text-lg font-semibold text-zinc-900">
              {formatMonthlyPrice(billboard.monthlyPrice)}
            </p>
          </header>

          {billboard.description ? (
            <p className="text-sm leading-relaxed text-zinc-600">{billboard.description}</p>
          ) : null}

          <dl className="space-y-0">
            <BillboardDetailRow label="Type" value={typeLabel} />
            <BillboardDetailRow
              label="Location"
              value={`${location.address}, ${location.city}, ${location.country}`}
            />
            <BillboardDetailRow
              label="Dimensions"
              value={`${dimensions.width} × ${dimensions.height} ${dimensions.unit}`}
            />
            <BillboardDetailRow
              label="Traffic count"
              value={
                billboard.trafficCount !== undefined
                  ? trafficFormatter.format(billboard.trafficCount)
                  : 'Not available'
              }
            />
            <BillboardDetailRow
              label="Monthly price"
              value={formatMonthlyPrice(billboard.monthlyPrice)}
            />
          </dl>

          {isDigital && spec ? <DigitalSpecPanel spec={spec} /> : null}

          <ReserveButton isAvailable={billboard.isAvailable} />
        </div>
      </div>
    </section>
  );
}
