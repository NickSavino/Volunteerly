import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@volunteerly/shared"],
  watchOptions: {
    pollIntervalMs: 800,
  },
};

export default nextConfig;
