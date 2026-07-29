import type { NextConfig } from 'next';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

/**
 * Baseline response headers for every route.
 *
 * A Content-Security-Policy is deliberately not set here: Next injects inline
 * bootstrap scripts, so a useful policy needs per-request nonces via middleware
 * rather than a static header, and a wrong one silently breaks the app. These
 * are the headers that are safe to apply unconditionally.
 */
const SECURITY_HEADERS = [
  // Browsers must not re-interpret a response as a different content type.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Clickjacking: nothing in this app is designed to be framed.
  { key: 'X-Frame-Options', value: 'DENY' },
  // Leak only the origin to third parties, never the full path or query.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // No route uses these; deny them so an injected script cannot either.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // Pin clients to HTTPS for two years, including subdomains.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
];

/**
 * Every uploaded billboard image and creative is served from the configured
 * ImageKit account, and `next/image` refuses any host it was not told about.
 * The host is derived from the same variable the uploader uses so a deployment
 * cannot allow-list one account while uploading to another.
 */
function imageKitHostname(): string | null {
  const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.trim();
  if (!endpoint) return null;

  try {
    return new URL(endpoint).hostname;
  } catch {
    return null;
  }
}

const REMOTE_IMAGE_HOSTS = ['images.unsplash.com', imageKitHostname() ?? 'ik.imagekit.io'].filter(
  (hostname, index, all) => all.indexOf(hostname) === index,
);

const nextConfig: NextConfig = {
  // Hides the framework version from responses.
  poweredByHeader: false,

  images: {
    remotePatterns: REMOTE_IMAGE_HOSTS.map((hostname) => ({
      protocol: 'https' as const,
      hostname,
    })),
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
      {
        // Authenticated JSON must never be stored by a shared cache or replayed
        // from the browser's back/forward cache.
        source: '/api/:path*',
        headers: [
          ...SECURITY_HEADERS,
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
    ];
  },
};

export default nextConfig;
