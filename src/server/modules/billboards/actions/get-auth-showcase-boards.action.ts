import { unstable_cache } from 'next/cache';
import { billboardService } from '@/server/modules/billboards/billboard.service';
import type { PublicBillboard } from '@/shared/types/billboard';

const AUTH_SHOWCASE_REVALIDATE_SECONDS = 600;
const MAX_SHOWCASE_BOARDS = 5;

const getCachedShowcaseBoards = unstable_cache(
  () => billboardService.listPublic(),
  ['auth-showcase-billboard-inventory'],
  {
    revalidate: AUTH_SHOWCASE_REVALIDATE_SECONDS,
    tags: ['billboards', 'auth-showcase'],
  },
);

/**
 * Real inventory for the artwork beside the sign-in forms — only boards that
 * actually have a photograph, since the panel is the photograph.
 *
 * Fails closed to an empty list: signing in must never depend on the catalogue
 * being reachable, and the panel renders a plain branded surface when it is not.
 */
export async function getAuthShowcaseBoards(): Promise<PublicBillboard[]> {
  try {
    const billboards = await getCachedShowcaseBoards();

    return billboards
      .filter((billboard) => Boolean(billboard.images[0]))
      .slice(0, MAX_SHOWCASE_BOARDS);
  } catch {
    return [];
  }
}
