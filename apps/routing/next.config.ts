import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Transpile internal packages that export TypeScript source
  transpilePackages: ["@repo/middleware"],
};

export default nextConfig;
