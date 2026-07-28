import type { Metadata } from 'next';
import { PaymentCancelledView } from '@/client/features/payments/pages/payment-result-page';
import { PRIVATE_ROUTE_METADATA } from '@/shared/seo/metadata';

export const metadata: Metadata = PRIVATE_ROUTE_METADATA;

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { bookingId } = await searchParams;
  return <PaymentCancelledView bookingId={bookingId} />;
}
