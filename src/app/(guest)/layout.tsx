import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function GuestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (session?.user?.id && session.user.isActive) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
