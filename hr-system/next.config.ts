import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/error/:path*",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
