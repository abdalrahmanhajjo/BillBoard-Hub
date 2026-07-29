import type { Metadata } from 'next';
import { ContentPage } from '@/client/features/content/components/content-page';
import { PAGES } from '@/client/features/content/data/pages';
import { CONTENT_SEO } from '@/client/features/content/data/seo';
import { createPageMetadata } from '@/shared/seo/metadata';

const page = PAGES.about;
const seo = CONTENT_SEO.about;
export const metadata: Metadata = createPageMetadata(seo);

export default function AboutPage() {
  return <ContentPage page={page} seo={seo} />;
}
