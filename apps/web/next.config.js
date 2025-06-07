const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@headlessui/react', '@heroicons/react', '@/blocks'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/blocks': '../../blocks'
    }

    // Add require-in-the-middle to externals
    config.externals = config.externals || [];
    config.externals.push("require-in-the-middle");

    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    }

    return config;
  },
  // Enable image optimization
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable experimental features
  experimental: {
    optimizeCss: false,
    scrollRestoration: true,
  }
}

module.exports = withNextIntl(nextConfig);