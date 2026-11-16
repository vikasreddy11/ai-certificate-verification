/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/portal/company', destination: '/verify', permanent: false },
      { source: '/company', destination: '/verify', permanent: false },
      { source: '/company/:path*', destination: '/verify', permanent: false },
    ];
  },
};

module.exports = nextConfig;
