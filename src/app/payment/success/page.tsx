import type { Metadata } from 'next';
import { PaymentSuccessView } from '@/client/features/payments/pages/payment-result-page';
import { PRIVATE_ROUTE_METADATA } from '@/shared/seo/metadata';

export const metadata: Metadata = PRIVATE_ROUTE_METADATA;

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  return <PaymentSuccessView sessionId={sessionId} />;
}
