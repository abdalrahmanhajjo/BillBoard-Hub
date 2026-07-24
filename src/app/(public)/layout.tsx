import { auth } from '@/auth';
import { Navbar } from '@/client/features/home/components/navbar';
import { Footer } from '@/client/features/home/components/footer';

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user =
    session?.user?.id && session.user.isActive
      ? {
          name: session.user.name ?? undefined,
          email: session.user.email ?? undefined,
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          role: session.user.role,
        }
      : null;

  return (
    <div className="flex min-h-full flex-col bg-white">
      <Navbar user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
