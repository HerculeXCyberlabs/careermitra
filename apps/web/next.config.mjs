/** @type {import('next').NextConfig} */
const nextConfig = {
  // pg is a native server-only dependency; keep it out of the bundle (Next 14 key).
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
};

export default nextConfig;
