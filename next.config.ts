import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Image domains ─────────────────────────────────────────────────────────
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

  // ─── API Reverse Proxy Rewrites ──────────────────────────────────────────────
  // Transparently proxies all browser /api/* requests from http://localhost:3000
  // directly to the FastAPI backend (http://localhost:8000/api/*).
  // Browser never touches port 8000 directly.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/health",
        destination: `${backendUrl}/health`,
      },
    ];
  },

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
