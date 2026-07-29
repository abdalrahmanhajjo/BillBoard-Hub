import type { MetadataRoute } from 'next';
import { SITE, absoluteUrl } from '@/shared/seo/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/user/'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE.url,
  };
}
