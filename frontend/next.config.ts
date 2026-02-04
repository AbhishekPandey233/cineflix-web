import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Force Turbopack to use this folder as the workspace root
  turbopack: {
    root: ".",
  },
  images: {
    // Allow loading images served from the backend during development (localhost:5000)
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "5000", pathname: "/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "5000", pathname: "/uploads/**" },
      // In case backend uses a different port or runs on https in other environments
      { protocol: "http", hostname: "localhost", pathname: "/uploads/**" },
      { protocol: "https", hostname: "localhost", pathname: "/uploads/**" },
    ],
  },
};

export default nextConfig;
