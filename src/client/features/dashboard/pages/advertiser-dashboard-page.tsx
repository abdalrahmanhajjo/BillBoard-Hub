import { billboardService } from '@/server/modules/billboards/billboard.service';
import { BrowseBillboardsPage } from '../../public-catalog/pages/browse-billboards-page';
import { PublicBillboard } from '@/shared/types/billboard';

export async function AdvertiserDashboardFeaturePage() {
  let billboards: PublicBillboard[] = [];
  let error: string | null = null;

  try {
    billboards = await billboardService.listPublic();
  } catch {
    error = 'We could not load billboards right now. Refresh the page to try again.';
  }

  return <BrowseBillboardsPage billboards={billboards} error={error} />;
}
