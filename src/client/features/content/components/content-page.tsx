import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { JsonLd } from '@/client/ui/components/seo/json-ld';
import type { ContentSeoEntry } from '@/client/features/content/data/seo';
import { breadcrumbSchema, contentPageSchema, serviceSchema } from '@/shared/seo/schema';

type ContentSection = {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  cards?: { title: string; description: string; href?: string }[];
};

export type ContentPageData = {
  eyebrow: string;
  title: string;
  intro: string;
  updated?: string;
  sections: ContentSection[];
  cta?: { label: string; href: string };
};

/**
 * Shared long-form content page for the static/marketing pages linked from the
 * footer (About, Careers, legal, Solutions, …). Renders inside the public
 * layout, so it inherits the navbar, footer, and ambient background.
 */
export function ContentPage({ page, seo }: { page: ContentPageData; seo: ContentSeoEntry }) {
  const schemas = [
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: page.title, path: seo.path },
    ]),
    contentPageSchema({
      name: seo.title,
      description: seo.description,
      path: seo.path,
      pageType: seo.pageType,
    }),
    ...(seo.service
      ? [
          serviceSchema({
            name: seo.title,
            description: seo.description,
            path: seo.path,
          }),
        ]
      : []),
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20 lg:max-w-5xl lg:py-24">
      <JsonLd data={schemas} />
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-blue-600"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to home
      </Link>

      <header className="mt-6 max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-blue-600 uppercase">
          {page.eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tighter text-balance sm:text-5xl">
          {page.title}
        </h1>
        {page.updated ? (
          <p className="mt-3 text-xs text-zinc-500">Last updated {page.updated}</p>
        ) : null}
        <p className="mt-5 text-lg leading-8 text-zinc-600">{page.intro}</p>
      </header>

      <div className="mt-12 space-y-12">
        {page.sections.map((section, index) => (
          <section key={section.heading ?? index} className="max-w-3xl">
            {section.heading ? (
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
                {section.heading}
              </h2>
            ) : null}

            {section.paragraphs?.map((paragraph, pIndex) => (
              <p key={pIndex} className="mt-3 leading-7 text-zinc-600">
                {paragraph}
              </p>
            ))}

            {section.bullets ? (
              <ul className="mt-4 space-y-2.5">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5 text-zinc-700">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Check className="size-3" aria-hidden />
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}

            {section.cards ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {section.cards.map((card) => {
                  const content = (
                    <>
                      <p className="font-semibold text-zinc-900">{card.title}</p>
                      <p className="mt-1.5 text-sm leading-6 text-zinc-600">{card.description}</p>
                      {card.href ? (
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                          Read guide
                          <ArrowRight className="size-4" aria-hidden />
                        </span>
                      ) : null}
                    </>
                  );

                  return card.href ? (
                    <Link
                      key={card.title}
                      href={card.href}
                      className="group rounded-2xl border border-zinc-200 bg-white/70 p-5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div
                      key={card.title}
                      className="rounded-2xl border border-zinc-200 bg-white/70 p-5 backdrop-blur-sm"
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </section>
        ))}
      </div>

      {page.cta ? (
        <div className="mt-16 flex flex-col items-start gap-5 rounded-2xl border border-blue-200 bg-blue-50/70 p-6 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-lg font-semibold text-zinc-900">Ready to get started?</p>
            <p className="mt-1 text-sm text-zinc-600">
              Browse live inventory or talk to our team about your next campaign.
            </p>
          </div>
          <Link
            href={page.cta.href}
            className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {page.cta.label}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
