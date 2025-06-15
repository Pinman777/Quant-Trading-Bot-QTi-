/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    emotion: true,
  },
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverComponents: true,
  },
  transpilePackages: ['@mui/material', '@mui/system', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
  webpack: (config, { isServer }) => {
    // Resolve directory imports like '@mui/material/styles' to their 'index.js' file
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.jsx', '.tsx', '.json', '/index.js'],
      '.mjs': ['.mjs', '.mts', '/index.mjs'],
      '.jsx': ['.jsx', '.tsx', '.js', '.ts', '.json', '/index.jsx'],
      '.ts': ['.ts', '.js', '.tsx', '.jsx', '.json', '/index.ts'],
      '.tsx': ['.tsx', '.jsx', '.ts', '.js', '.json', '/index.tsx'],
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mui/material/styles': '@mui/material/styles/index.js',
    };
    return config;
  },
};

module.exports = nextConfig; 