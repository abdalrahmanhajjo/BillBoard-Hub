import type { FaqItem } from '@/client/features/home/home.types';
import type { PublicBillboard } from '@/shared/types/billboard';
import { SITE, absoluteUrl } from '@/shared/seo/site';

export type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    description: SITE.description,
    areaServed: {
      '@type': 'Country',
      name: 'Lebanon',
    },
  };
}

export function websiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    inLanguage: SITE.language,
    publisher: { '@id': `${SITE.url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteUrl('/billboards')}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; path: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(faqs: FaqItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function contentPageSchema(input: {
  name: string;
  description: string;
  path: string;
  pageType?: 'WebPage' | 'AboutPage' | 'CollectionPage' | 'ContactPage';
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': input.pageType ?? 'WebPage',
    '@id': `${absoluteUrl(input.path)}#webpage`,
    url: absoluteUrl(input.path),
    name: input.name,
    description: input.description,
    inLanguage: SITE.language,
    isPartOf: { '@id': `${SITE.url}/#website` },
    about: { '@id': `${SITE.url}/#organization` },
  };
}

export function serviceSchema(input: {
  name: string;
  description: string;
  path: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    provider: { '@id': `${SITE.url}/#organization` },
    areaServed: {
      '@type': 'Country',
      name: 'Lebanon',
    },
    serviceType: 'Out-of-home billboard advertising',
  };
}

export function billboardProductSchema(billboard: PublicBillboard): Record<string, unknown> {
  const url = absoluteUrl(`/billboards/${billboard.id}`);
  const images = billboard.images.map((image) => absoluteUrl(image));
  const dimensions = `${billboard.dimensions.width} × ${billboard.dimensions.height} ${billboard.dimensions.unit}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#billboard`,
    name: billboard.name,
    description:
      billboard.description ??
      `${billboard.type === 'digital' ? 'Digital' : 'Static'} billboard advertising in ${billboard.location.city}, Lebanon.`,
    url,
    image: images.length > 0 ? images : undefined,
    category: `${billboard.type === 'digital' ? 'Digital' : 'Static'} billboard advertising`,
    brand: {
      '@type': 'Brand',
      name: SITE.name,
    },
    areaServed: {
      '@type': 'City',
      name: billboard.location.city,
      containedInPlace: {
        '@type': 'Country',
        name: billboard.location.country,
      },
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Dimensions',
        value: dimensions,
      },
      ...(billboard.trafficCount
        ? [
            {
              '@type': 'PropertyValue',
              name: 'Estimated monthly traffic',
              value: billboard.trafficCount,
            },
          ]
        : []),
    ],
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: SITE.currency,
      price: billboard.monthlyPrice,
      availability: billboard.isAvailable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}

export function blogPostingSchema(input: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  image?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${absoluteUrl(input.path)}#article`,
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    image: input.image ? absoluteUrl(input.image) : absoluteUrl(SITE.defaultSocialImage),
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    inLanguage: SITE.language,
    author: {
      '@type': 'Organization',
      name: input.author,
      url: SITE.url,
    },
    publisher: { '@id': `${SITE.url}/#organization` },
    mainEntityOfPage: { '@id': `${absoluteUrl(input.path)}#webpage` },
  };
}
