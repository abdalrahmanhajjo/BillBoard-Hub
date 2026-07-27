import { auth } from '@/auth';
import { Navbar } from '@/client/features/home/components/navbar';
import { Footer } from '@/client/features/home/components/footer';
import { PageBackground } from '@/client/features/home/components/page-background';

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
    <div className="relative isolate flex min-h-full flex-col">
      <PageBackground />
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Navbar user={user} />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
