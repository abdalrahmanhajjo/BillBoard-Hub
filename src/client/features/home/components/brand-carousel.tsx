import type { BrandItem } from '@/client/features/home/home.types';

/**
 * Infinite, auto-scrolling logo strip. The list is duplicated so the CSS
 * marquee (see `@keyframes marquee` in globals.css) loops seamlessly, and it
 * pauses on hover.
 */
export function BrandCarousel({ brands }: { brands: BrandItem[] }) {
  const loop = [...brands, ...brands];

  return (
    <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="flex w-max animate-[marquee_32s_linear_infinite] items-center gap-x-20 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {loop.map((brand, index) => (
          <span
            key={`${brand.name}-${index}`}
            aria-hidden={index >= brands.length}
            className="shrink-0 text-2xl font-semibold tracking-tight text-zinc-400 grayscale transition-colors hover:text-zinc-600"
          >
            {brand.name}
          </span>
        ))}
      </div>
    </div>
  );
}
