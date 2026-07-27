import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { billboardService } from '@/server/modules/billboards/billboard.service';
import { NotFoundError } from '@/server/http/http-error';
import type { PublicBillboard } from '@/shared/types/billboard';
import { ReservationCheckoutPage } from '@/client/features/bookings/pages/reservation-checkout-page';

type RouteParams = {
  params: Promise<{ billboardId: string }>;
  searchParams: Promise<{ start?: string; end?: string }>;
};

// Reservations depend on live inventory and the current session.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Reserve billboard',
  description: 'Submit a reservation request for a billboard advertising campaign.',
};

function isNotFound(error: unknown): boolean {
  return error instanceof NotFoundError || (error as { name?: string })?.name === 'CastError';
}

export default async function ReservationRoute({ params, searchParams }: RouteParams) {
  const { billboardId } = await params;
  const { start, end } = await searchParams;

  let billboard: PublicBillboard;
  try {
    billboard = await billboardService.getPublicById(billboardId);
  } catch (error) {
    if (isNotFound(error)) {
      notFound();
    }
    throw error;
  }

  const session = await auth();
  const viewer =
    session?.user?.id && session.user.isActive
      ? {
          fullName:
            [session.user.firstName, session.user.lastName].filter(Boolean).join(' ') ||
            (session.user.email ?? ''),
          email: session.user.email ?? '',
          role: session.user.role,
        }
      : null;

  return (
    <ReservationCheckoutPage
      billboard={billboard}
      viewer={viewer}
      initialStart={start}
      initialEnd={end}
    />
  );
}
