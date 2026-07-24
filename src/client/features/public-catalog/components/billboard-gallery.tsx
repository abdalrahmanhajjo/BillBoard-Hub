'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

type BillboardGalleryProps = {
  images: string[];
  name: string;
};

const MAIN_IMAGE_SIZES = '(min-width: 1024px) 60vw, 100vw';

export function BillboardGallery({ images, name }: BillboardGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0] ?? null);

  if (!activeImage) {
    return (
      <div className="flex aspect-16/10 w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-400">
        <ImageIcon className="h-10 w-10" aria-hidden />
        <span className="sr-only">No image available</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
        <Image
          src={activeImage}
          alt={name}
          fill
          priority
          sizes={MAIN_IMAGE_SIZES}
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <ul className="flex flex-wrap gap-3">
          {images.map((image) => {
            const isActive = image === activeImage;

            return (
              <li key={image}>
                <button
                  type="button"
                  onClick={() => setActiveImage(image)}
                  aria-label={`Show image of ${name}`}
                  aria-pressed={isActive}
                  className={`relative h-20 w-20 overflow-hidden rounded-md border transition-colors ${
                    isActive ? 'border-zinc-900' : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <Image src={image} alt="" fill sizes="80px" className="object-cover" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
