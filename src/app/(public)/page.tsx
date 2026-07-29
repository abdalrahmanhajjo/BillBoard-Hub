import type { Metadata } from 'next';
import { HomePage } from '@/client/features/home/pages/home-page';
import { buildHomeData } from '@/client/features/home/data/build-home-data';
import { getHomepageInventory } from '@/server/modules/billboards/actions/get-homepage-inventory.action';
import { createPageMetadata } from '@/shared/seo/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Billboard Advertising Across Lebanon',
  description:
    'Discover verified static and digital billboard locations across Beirut and Lebanon. Compare formats, traffic, pricing and campaign dates.',
  path: '/',
  keywords: [
    'billboard advertising Lebanon',
    'outdoor advertising Lebanon',
    'billboard rental Beirut',
    'digital billboards Lebanon',
    'OOH advertising Lebanon',
  ],
  imageAlt: 'Premium billboard advertising location on the Lebanese coast',
});

export default async function HomeRoute() {
  const billboards = await getHomepageInventory();
  return <HomePage {...buildHomeData(billboards)} />;
}
