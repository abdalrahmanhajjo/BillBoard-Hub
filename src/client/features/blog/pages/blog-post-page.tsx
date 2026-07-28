import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { BlogPost } from '@/client/features/blog/blog.types';

export function BlogPostPage({ post }: { post: BlogPost }) {
  return (
    <article className="mx-auto w-full max-w-5xl px-6 py-14 sm:py-20 lg:py-24">
      <Link
        href="/blog"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-zinc-500 transition-colors hover:text-blue-600"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All guides
      </Link>

      <header className="mt-8 max-w-4xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-blue-600 uppercase">
          Outdoor advertising guide
        </p>
        <h1 className="mt-5 text-4xl leading-[1.02] font-semibold tracking-tighter text-balance sm:text-6xl">
          {post.title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600">{post.description}</p>
        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-500">
          <span>By {post.author}</span>
          <time dateTime={post.publishedAt}>
            {new Intl.DateTimeFormat('en-LB', { dateStyle: 'long' }).format(
              new Date(`${post.publishedAt}T00:00:00Z`),
            )}
          </time>
          <span>{post.readingMinutes} min read</span>
        </div>
      </header>

      <div className="relative mt-10 aspect-[16/8.5] overflow-hidden rounded-[24px] bg-zinc-100 sm:mt-14 sm:rounded-[30px]">
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          priority
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="object-cover"
        />
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-20">
        <div className="space-y-12">
          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-3xl">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-5 text-base leading-8 text-zinc-600">
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="mt-5 list-disc space-y-3 pl-5 text-base leading-7 text-zinc-600 marker:text-blue-600">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="font-semibold text-zinc-950">Plan your campaign</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Compare verified billboard locations, formats and monthly rates across Lebanon.
            </p>
            <Link
              href="/billboards"
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-700"
            >
              Browse inventory
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </aside>
      </div>
    </article>
  );
}
