import type { Metadata } from 'next';
import { Inter, Geist, Geist_Mono } from 'next/font/google';
import { AnalyticsScripts } from '@/client/features/analytics/components/analytics-scripts';
import { SITE, absoluteUrl } from '@/shared/seo/site';
import './globals.css';
import { cn } from '@/client/ui/lib/utils';
import QueryProvider from '@/client/providers/query-provider';
import { ThemeProvider } from '@/client/ui/providers/theme-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Billboard Advertising in Lebanon | Boardly',
    template: '%s | Boardly',
  },
  description: SITE.description,
  applicationName: SITE.name,
  category: 'business',
  creator: SITE.name,
  publisher: SITE.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: 'Billboard Advertising in Lebanon | Boardly',
    description: SITE.description,
    images: [
      {
        url: absoluteUrl(SITE.defaultSocialImage),
        width: 1200,
        height: 630,
        alt: 'Premium billboard advertising location on the Lebanese coast',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Billboard Advertising in Lebanon | Boardly',
    description: SITE.description,
    images: [absoluteUrl(SITE.defaultSocialImage)],
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        'font-sans',
        inter.variable,
      )}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryProvider>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
