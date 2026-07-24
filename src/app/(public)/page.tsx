import type { Metadata } from 'next';
import { billboardService } from '@/server/modules/billboards/billboard.service';
import { HomePage } from '@/client/features/home/pages/home-page';
import { displayCity, normalizeCity } from '@/client/features/home/lib/city';
import type { HomeData, MarketOverviewEntry } from '@/client/features/home/home.types';
import type { PublicBillboard } from '@/shared/types/billboard';

export const metadata: Metadata = {
  title: {
    absolute: 'Boardly — Billboard advertising across Lebanon',
  },
  description:
    'Discover, plan, and book out of home billboard campaigns across Lebanon. Premium inventory, real-time availability, and transparent pricing.',
};

// Inventory changes over time, so render per-request rather than statically.
export const dynamic = 'force-dynamic';

function buildHomeData(billboards: PublicBillboard[]): HomeData {
  // Group cities case-insensitively so "Tripoli" and "tripoli" are one place.
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
    cities,
    marketOverview,
    stats: { placements: billboards.length, cities: cities.length },
  };
}

export default async function HomeRoute() {
  let billboards: PublicBillboard[] = [];

  try {
    billboards = await billboardService.listPublic();
  } catch {
    // Never fail the marketing homepage over an inventory read; show it empty.
    billboards = [];
  }

  return <HomePage {...buildHomeData(billboards)} />;
}
