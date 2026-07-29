import { displayCity, normalizeCity } from '@/client/features/home/lib/city';
import { homepageContent } from '@/client/features/home/data/homepage';
import type { HomeData, MarketOverviewEntry } from '@/client/features/home/home.types';
import type { PublicBillboard } from '@/shared/types/billboard';

export function buildHomeData(billboards: PublicBillboard[]): HomeData {
  const cityMap = new Map<string, { display: string; count: number }>();

  for (const billboard of billboards) {
    const key = normalizeCity(billboard.location.city);
    const existing = cityMap.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      cityMap.set(key, { display: displayCity(billboard.location.city), count: 1 });
    }
  }

  const cities = [...cityMap.values()]
    .map((entry) => entry.display)
    .sort((a, b) => a.localeCompare(b));
  const marketOverview: MarketOverviewEntry[] = [...cityMap.values()]
    .map((entry) => ({ city: entry.display, count: entry.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    billboards,
    marketOverview,
    stats: { placements: billboards.length, cities: cities.length },
    content: homepageContent,
  };
}
