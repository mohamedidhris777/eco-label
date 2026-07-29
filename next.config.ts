import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Image domains (add as needed) ────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.ecolabelx.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  // ─── Strict mode for catching common issues ────────────────────────────────
  reactStrictMode: true,

  // ─── Type-safe routes ─────────────────────────────────────────────────────────
  typedRoutes: true,

  // ─── Security headers ─────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",          value: "DENY"                    },
          { key: "X-Content-Type-Options",   value: "nosniff"                 },
          { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
