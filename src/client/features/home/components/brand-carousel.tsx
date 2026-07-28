import type { BrandItem } from '@/client/features/home/home.types';
import { BrandMark } from '@/client/features/home/components/brand-mark';

/**
 * Infinite, auto-scrolling logo strip. The list is duplicated so the CSS
 * marquee (see `@keyframes marquee` in globals.css) loops seamlessly, and it
 * pauses on hover. Each brand renders its real logo when available and falls
 * back to a generated wordmark lockup (see `BrandMark`) so the strip always
 * reads as a logo wall.
 */
export function BrandCarousel({ brands }: { brands: BrandItem[] }) {
  const loop = [...brands, ...brands];

  return (
    <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="flex w-max animate-[marquee_32s_linear_infinite] items-center gap-x-16 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {loop.map((brand, index) => (
          <span
            key={`${brand.name}-${index}`}
            aria-hidden={index >= brands.length}
            className="flex shrink-0 items-center text-zinc-400 grayscale transition hover:text-zinc-700 hover:grayscale-0"
          >
            <BrandMark brand={brand} index={index % brands.length} />
          </span>
        ))}
      </div>
    </div>
  );
}
