/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Native / heavy server-only deps used by the API route handlers.
  // Keeping them external prevents Next from trying to bundle them.
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
