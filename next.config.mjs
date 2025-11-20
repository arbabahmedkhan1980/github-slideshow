/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
  },
  images: {
    remotePatterns: []
  },
  webpack: (config) => {
    config.externals = config.externals || [];
    return config;
  }
};

export default nextConfig;
