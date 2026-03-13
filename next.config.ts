import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    APIFY_API_KEY: process.env.APIFY_API_KEY,
    SHUFERSAL_EMAIL: process.env.SHUFERSAL_EMAIL,
    SHUFERSAL_PASSWORD: process.env.SHUFERSAL_PASSWORD,
  },
};

export default nextConfig;
