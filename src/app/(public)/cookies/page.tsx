import type { Metadata } from 'next';
import { ContentPage } from '@/client/features/content/components/content-page';
import { PAGES } from '@/client/features/content/data/pages';
import { CONTENT_SEO } from '@/client/features/content/data/seo';
import { createPageMetadata } from '@/shared/seo/metadata';

const page = PAGES.cookies;
const seo = CONTENT_SEO.cookies;
export const metadata: Metadata = createPageMetadata(seo);

export default function CookiesPage() {
  return <ContentPage page={page} seo={seo} />;
}
