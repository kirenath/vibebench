import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/s/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; form-action 'none'; frame-ancestors 'self'; base-uri 'self';",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
