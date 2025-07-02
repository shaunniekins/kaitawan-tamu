/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Remove API routes and middleware for static export
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
