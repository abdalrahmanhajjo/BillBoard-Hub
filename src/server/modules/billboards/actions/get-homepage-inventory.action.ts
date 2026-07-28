import { unstable_cache } from 'next/cache';
import { billboardService } from '@/server/modules/billboards/billboard.service';
import type { PublicBillboard } from '@/shared/types/billboard';

const HOMEPAGE_INVENTORY_REVALIDATE_SECONDS = 300;

const getCachedHomepageInventory = unstable_cache(
  () => billboardService.listPublic(),
  ['homepage-public-billboard-inventory'],
  {
    revalidate: HOMEPAGE_INVENTORY_REVALIDATE_SECONDS,
    tags: ['billboards', 'homepage-inventory'],
  },
);

/**
 * Marketing inventory should stay fresh without opening a database connection
 * for every anonymous page view. Fail closed to an empty edit so the homepage
 * remains available during transient database incidents.
 */
export async function getHomepageInventory(): Promise<PublicBillboard[]> {
  try {
    return await getCachedHomepageInventory();
  } catch {
    return [];
  }
}
