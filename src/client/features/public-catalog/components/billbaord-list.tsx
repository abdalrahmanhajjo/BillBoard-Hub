import * as React from 'react';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/client/ui/components/ui/carousel';
import { PublicBillboard } from '@/shared/types/billboard';
import { BillboardCard } from './billboard-card';

interface BillBoardListProps {
  billboards: PublicBillboard[];
  emptyMessage?: string;
}

export function BillBoardList({ billboards, emptyMessage }: BillBoardListProps) {
  if (billboards.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <Carousel className="mx-10">
      <CarouselContent className="-ml-1">
        {billboards.map((billboard, index) => (
          <CarouselItem key={index} className="basis-1/2 pl-1 lg:basis-1/3">
            <div className="p-1">
              <BillboardCard billboard={billboard} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-left-8" />
      <CarouselNext className="-right-8" />
    </Carousel>
  );
}
