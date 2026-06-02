/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    buildActivity: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
