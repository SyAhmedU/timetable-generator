import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/timetable-generator',
  images: { unoptimized: true },
};

export default nextConfig;
