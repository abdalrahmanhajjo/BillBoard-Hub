'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { Button } from '@/client/ui/components/ui/button';

type BillboardGalleryProps = {
  images: string[];
  name: string;
};

const MAIN_IMAGE_SIZES = '(min-width: 1024px) 60vw, 100vw';

export function BillboardGallery({ images, name }: BillboardGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0] ?? null);

  if (!activeImage) {
    return (
      <div className="flex aspect-16/10 w-full items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-zinc-400">
        <ImageIcon className="h-10 w-10" aria-hidden />
        <span className="sr-only">No image available</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
        <Image
          src={activeImage}
          alt={name}
          fill
          priority
          sizes={MAIN_IMAGE_SIZES}
          className="object-cover"
        />
      </div>

      {images.length > 0 ? (
        <ul className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image) => {
            const isActive = image === activeImage;

            return (
              <li key={image}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveImage(image)}
                  aria-label={`Show image of ${name}`}
                  aria-pressed={isActive}
                  className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                    isActive ? 'border-blue-600' : 'border-transparent hover:border-zinc-300'
                  }`}
                >
                  <Image src={image} alt="" fill sizes="80px" className="object-cover" />
                </Button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
