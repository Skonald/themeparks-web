import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/plan", destination: "/download", permanent: true },
      { source: "/account", destination: "/download", permanent: true },
      { source: "/login", destination: "/download", permanent: true },
      { source: "/signup", destination: "/download", permanent: true },
    ];
  },
};

export default nextConfig;
