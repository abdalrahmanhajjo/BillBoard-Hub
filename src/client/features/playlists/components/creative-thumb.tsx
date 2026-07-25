import { CREATIVE_TYPES } from '@/shared/constants/creative';
import type { Creative } from '@/shared/types/creative';

/** Small preview of a creative (image or muted video). */
export function CreativeThumb({ creative, className }: { creative: Creative; className?: string }) {
  if (creative.type === CREATIVE_TYPES.VIDEO) {
    return <video src={creative.assetUrl} className={className} muted playsInline />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={creative.assetUrl} alt={creative.name} className={className} />;
}
