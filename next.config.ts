import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip type checking during build (already handled separately)
  typescript: { ignoreBuildErrors: true },
  // Skip ESLint during build
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
