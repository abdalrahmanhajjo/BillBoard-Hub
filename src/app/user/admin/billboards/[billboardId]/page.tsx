import { BillboardDetailsPage } from '@/client/features/billboards/pages/billboard-details-page';

export default async function AdminBillboardDetailsRoute({
  params,
}: {
  params: Promise<{ billboardId: string }>;
}) {
  const { billboardId } = await params;

  return <BillboardDetailsPage billboardId={billboardId} />;
}
