'use client';

import { useState } from 'react';
import type { BrandItem } from '@/client/features/home/home.types';
import { BrandWordmark } from '@/client/features/home/components/brand-wordmark';

/**
 * Renders a brand's real logo (from `public/brands/`) when available, and
 * gracefully falls back to the generated wordmark if no logo is set or the
 * image fails to load. This lets us drop real logo files in over time without
 * ever showing a broken image.
 */
export function BrandMark({ brand, index }: { brand: BrandItem; index: number }) {
  const [failed, setFailed] = useState(false);

  if (brand.logo && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={brand.logo}
        alt={brand.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-7 w-auto object-contain sm:h-8"
      />
    );
  }

  return <BrandWordmark brand={brand} index={index} />;
}
