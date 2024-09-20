/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [];
  },
  transpilePackages: ["three"],
};

module.exports = nextConfig;
