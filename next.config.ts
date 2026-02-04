import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure Turbopack uses the `frontend` folder as the workspace root
  turbopack: {
    root: "./frontend",
  },
};

export default nextConfig;
