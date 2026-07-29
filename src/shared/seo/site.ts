import { absoluteAppUrl, appUrl } from '@/shared/config/app-url';

export const SITE = {
  name: 'Boardly',
  legalName: 'Boardly',
  description:
    'Discover and reserve verified billboard advertising locations across Lebanon, including static and digital outdoor media.',
  locale: 'en_LB',
  language: 'en',
  country: 'LB',
  currency: 'USD',
  url: appUrl(),
  defaultSocialImage: '/images/inventory/featured-coastal-billboard.png',
} as const;

export function absoluteUrl(path = '/'): string {
  return absoluteAppUrl(path);
}
