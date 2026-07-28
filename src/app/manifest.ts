import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Boardly — Billboard Advertising in Lebanon',
    short_name: 'Boardly',
    description:
      'Discover and reserve verified static and digital billboard locations across Lebanon.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1556d7',
    lang: 'en',
    categories: ['business', 'marketing'],
  };
}
