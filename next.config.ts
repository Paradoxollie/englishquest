import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure that protected routes are not statically generated
  experimental: {
    // This helps prevent static generation of dynamic routes
  },
};

export default nextConfig;
