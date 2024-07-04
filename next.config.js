/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/ident/member/explore",
        permanent: false,
      },
      {
        source: "/ident/member",
        destination: "/ident/member/explore",
        permanent: false,
      },
    ];
  },
  transpilePackages: ['three'],
};

module.exports = nextConfig;