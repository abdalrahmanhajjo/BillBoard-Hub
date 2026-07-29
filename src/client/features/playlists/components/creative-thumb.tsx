import { AD_CREATIVE_TYPES } from '@/shared/constants/ad-creative';
import type { AdCreative } from '@/shared/types/ad-creative';

/** Small preview of a creative (image or muted video). */
export function CreativeThumb({
  creative,
  className,
}: {
  creative: AdCreative;
  className?: string;
}) {
  if (creative.fileType === AD_CREATIVE_TYPES.VIDEO) {
    return <video src={creative.url} className={className} muted playsInline />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={creative.url} alt={creative.name} className={className} />;
}
