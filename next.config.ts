import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable to prevent double mounting which causes socket disconnections
};

export default nextConfig;
