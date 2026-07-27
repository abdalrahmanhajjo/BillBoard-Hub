import { auth } from '@/auth';
import AuthLayout from '@/client/layouts/auth-layout';
import { SessionProvider } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id || !session.user.isActive) {
    redirect('/login');
  }

  return (
    <SessionProvider session={session}>
      <AuthLayout>{children}</AuthLayout>
    </SessionProvider>
  );
}
