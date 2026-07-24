import { Hero } from '@/client/features/home/components/hero';
import { Brands } from '@/client/features/home/components/brands';
import { HowItWorks } from '@/client/features/home/components/how-it-works';
import { BillboardFormats } from '@/client/features/home/components/billboard-formats';
import { InventoryShowcase } from '@/client/features/home/components/inventory-showcase';
import { Stats } from '@/client/features/home/components/stats';
import { Features } from '@/client/features/home/components/features';
import { Faq } from '@/client/features/home/components/faq';
import { Cta } from '@/client/features/home/components/cta';
import type { HomeData } from '@/client/features/home/home.types';
import { HomeAtmosphere } from '@/client/features/home/components/home-atmosphere';

export function HomePage({ billboards, marketOverview, stats }: HomeData) {
  return (
    <HomeAtmosphere>
      <Hero marketOverview={marketOverview} stats={stats} />
      <Brands />
      <HowItWorks />
      <BillboardFormats />
      <InventoryShowcase billboards={billboards} />
      <Stats stats={stats} />
      <Features />
      <Faq />
      <Cta />
    </HomeAtmosphere>
  );
}
