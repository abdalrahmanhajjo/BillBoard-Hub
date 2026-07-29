const DEFAULT_SITE_URL = 'http://localhost:3000';

function normalizeSiteUrl(value?: string): string {
  const candidate = value?.trim() || DEFAULT_SITE_URL;

  try {
    return new URL(candidate).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE = {
  name: 'Boardly',
  legalName: 'Boardly',
  description:
    'Discover and reserve verified billboard advertising locations across Lebanon, including static and digital outdoor media.',
  locale: 'en_LB',
  language: 'en',
  country: 'LB',
  currency: 'USD',
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL),
  defaultSocialImage: '/images/inventory/featured-coastal-billboard.png',
} as const;

export function absoluteUrl(path = '/'): string {
  return new URL(path, `${SITE.url}/`).toString();
}
