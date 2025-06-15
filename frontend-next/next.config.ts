import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Отключение Turbopack (экспериментально)
  experimental: {
    forceSwcTransforms: true, // Попытка использовать SWC вместо Turbopack для трансформаций
    // Если это не сработает, возможно, придется рассмотреть откат на Next.js 14
  },
  transpilePackages: ['recharts', 'framer-motion'],
};

export default nextConfig;
