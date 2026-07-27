import type { NextConfig } from 'next';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
