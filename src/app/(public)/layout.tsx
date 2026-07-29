import { auth } from '@/auth';
import { Navbar } from '@/client/features/home/components/navbar';
import { Footer } from '@/client/features/home/components/footer';
import { PageBackground } from '@/client/features/home/components/page-background';
import { redirect } from 'next/navigation';
import { ADVERTISER_ROUTES, ADMIN_ROUTES } from '@/shared/constants/routes';
import { USER_ROLES } from '@/shared/constants/user-roles';
import { JsonLd } from '@/client/ui/components/seo/json-ld';
import { organizationSchema, websiteSchema } from '@/shared/seo/schema';

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (session?.user?.id && session.user.isActive) {
    if (session.user.role === USER_ROLES.ADMIN) {
      redirect(ADMIN_ROUTES.DASHBOARD);
    }

    if (session.user.role === USER_ROLES.ADVERTISER) {
      redirect(ADVERTISER_ROUTES.DASHBOARD);
    }
  }

  return (
    <div className="relative isolate flex min-h-full flex-col">
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
      <PageBackground />
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Navbar
        viewer={
          session?.user?.id && session.user.isActive
            ? {
                firstName: session.user.firstName,
                lastName: session.user.lastName,
                email: session.user.email ?? '',
              }
            : null
        }
      />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
