import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_CONNECTED_ACCOUNT_ID: process.env.STRIPE_CONNECTED_ACCOUNT_ID,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
