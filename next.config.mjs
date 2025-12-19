// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Increase the body size limit for file uploads (100MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  // Configure webpack for pdfjs-dist and canvas compatibility
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize native modules for server-side
      config.externals = config.externals || [];
      config.externals.push({
        'canvas': 'commonjs canvas',
        'pdfjs-dist': 'commonjs pdfjs-dist',
      });
    }

    return config;
  },
  // Configure API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
}

export default nextConfig
