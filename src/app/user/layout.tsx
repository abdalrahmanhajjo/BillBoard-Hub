import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';
import { redirect } from 'next/navigation';

/**
 * Session and the signed-in gate only. The sidebar chrome belongs to each role's
 * own layout — admin keeps `AuthLayout`, advertiser uses `AdvertiserShell` —
 * because mounting one here would nest a second SidebarProvider inside it.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id || !session.user.isActive) {
    redirect('/login');
  }

  return <SessionProvider session={session}>{children}</SessionProvider>;
}
