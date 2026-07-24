import type { NextConfig } from 'next';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const nextConfig: NextConfig = {
  images: {
    // Billboard images are admin-supplied external URLs; allow optimized loading
    // from any HTTPS host for the MVP. Tighten to specific CDN hosts later.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
