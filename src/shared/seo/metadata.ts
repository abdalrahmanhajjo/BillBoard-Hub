import type { Metadata } from 'next';
import { SITE, absoluteUrl } from '@/shared/seo/site';

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
};

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  image = SITE.defaultSocialImage,
  imageAlt = 'Boardly billboard advertising marketplace in Lebanon',
  noIndex = false,
  type = 'website',
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const socialImage = absoluteUrl(image);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type,
      locale: SITE.locale,
      url: canonical,
      siteName: SITE.name,
      title,
      description,
      images: [{ url: socialImage, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImage],
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
  };
}

export const PRIVATE_ROUTE_METADATA: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};
