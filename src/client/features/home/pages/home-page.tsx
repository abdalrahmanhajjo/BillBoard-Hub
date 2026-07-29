import { Hero } from '@/client/features/home/components/hero';
import { Brands } from '@/client/features/home/components/brands';
import { HowItWorks } from '@/client/features/home/components/how-it-works';
import { BillboardFormats } from '@/client/features/home/components/billboard-formats';
import { InventoryShowcase } from '@/client/features/home/components/inventory-showcase';
import { Stats } from '@/client/features/home/components/stats';
import { Features } from '@/client/features/home/components/features';
import { Reviews } from '@/client/features/home/components/reviews';
import { Faq } from '@/client/features/home/components/faq';
import { Contact } from '@/client/features/home/components/contact';
import { Cta } from '@/client/features/home/components/cta';
import type { HomeData } from '@/client/features/home/home.types';
import { HomeAtmosphere } from '@/client/features/home/components/home-atmosphere';
import { JsonLd } from '@/client/ui/components/seo/json-ld';
import { faqSchema } from '@/shared/seo/schema';

export function HomePage({ billboards, marketOverview, stats, content }: HomeData) {
  return (
    <HomeAtmosphere>
      <JsonLd data={faqSchema(content.faqs)} />
      <Hero marketOverview={marketOverview} stats={stats} content={content.hero} />
      <Brands brands={content.brands} />
      <HowItWorks steps={content.howItWorks} />
      <BillboardFormats formats={content.formats} />
      <InventoryShowcase billboards={billboards} />
      <Stats stats={stats} items={content.stats} />
      <Features features={content.features} />
      <Reviews reviews={content.reviews} />
      <Faq faqs={content.faqs} />
      <Contact />
      <Cta />
    </HomeAtmosphere>
  );
}
