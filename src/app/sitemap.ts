import type { MetadataRoute } from 'next';
import { billboardService } from '@/server/modules/billboards/billboard.service';
import { absoluteUrl } from '@/shared/seo/site';
import { BLOG_POSTS } from '@/client/features/blog/data/posts';

export const revalidate = 3600;

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/billboards', changeFrequency: 'daily', priority: 0.95 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/solutions/brands', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/solutions/agencies', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/solutions/campaign-planning', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/solutions/audience-targeting', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/case-studies', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/guides', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/partners', changeFrequency: 'monthly', priority: 0.55 },
  { path: '/media-kit', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/press', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/careers', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/help', changeFrequency: 'monthly', priority: 0.45 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
  const articleEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(`${post.updatedAt}T00:00:00Z`),
    changeFrequency: 'monthly',
    priority: 0.72,
    images: [absoluteUrl(post.image)],
  }));

  try {
    const billboards = await billboardService.listPublic();
    const inventoryEntries: MetadataRoute.Sitemap = billboards.map((billboard) => ({
      url: absoluteUrl(`/billboards/${billboard.id}`),
      changeFrequency: 'daily',
      priority: billboard.isAvailable ? 0.85 : 0.65,
      images: billboard.images.map((image) => absoluteUrl(image)),
    }));

    return [...staticEntries, ...articleEntries, ...inventoryEntries];
  } catch {
    return [...staticEntries, ...articleEntries];
  }
}
