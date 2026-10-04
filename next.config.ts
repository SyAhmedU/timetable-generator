import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.VERCEL ? '' : '/timetable-generator',
  env: { NEXT_PUBLIC_BASE_PATH: process.env.VERCEL ? '' : '/timetable-generator' },
  images: { unoptimized: true },
};

export default nextConfig;
