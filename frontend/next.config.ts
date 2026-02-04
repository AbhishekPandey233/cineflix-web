import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Force Turbopack to use this folder as the workspace root
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
