import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BLOG_POSTS, getBlogPost } from '@/client/features/blog/data/posts';
import { BlogPostPage } from '@/client/features/blog/pages/blog-post-page';
import { JsonLd } from '@/client/ui/components/seo/json-ld';
import { createPageMetadata } from '@/shared/seo/metadata';
import { blogPostingSchema, breadcrumbSchema } from '@/shared/seo/schema';

type BlogPostRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: 'Article not found', robots: { index: false, follow: false } };

  return createPageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.keywords,
    image: post.image,
    imageAlt: post.imageAlt,
    type: 'article',
  });
}

export default async function BlogPostRoute({ params }: BlogPostRouteProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          blogPostingSchema({
            title: post.title,
            description: post.description,
            path: `/blog/${post.slug}`,
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
            author: post.author,
            image: post.image,
          }),
        ]}
      />
      <BlogPostPage post={post} />
    </>
  );
}
