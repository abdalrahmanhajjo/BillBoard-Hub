import type { PublicDigitalSpec } from '@/shared/types/billboard';
import { BillboardDetailRow } from '@/client/features/public-catalog/components/billboard-detail-row';

export function DigitalSpecPanel({ spec }: { spec: PublicDigitalSpec }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-medium">Digital specifications</h2>
      <dl className="space-y-0">
        <BillboardDetailRow
          label="Resolution"
          value={`${spec.resolution.width} × ${spec.resolution.height} px`}
        />
        <BillboardDetailRow label="Brightness" value={`${spec.brightness} nits`} />
        <BillboardDetailRow label="Slot duration" value={`${spec.slotDurationSeconds} s`} />
        <BillboardDetailRow label="Rotating ads" value={String(spec.rotatingAdsCount)} />
      </dl>
    </section>
  );
}
