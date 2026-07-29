/**
 * EcoLabel X — Global Error Boundary
 */
"use client";

import { useEffect } from "react";
import { ROUTES } from "@/lib/constants";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("EcoLabel X error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#050a18] text-white px-4">
        <div className="text-center space-y-6">
          <p className="text-red-400 font-display font-bold text-6xl">Error</p>
          <h1 className="font-display font-bold text-2xl text-white">Something went wrong</h1>
          <p className="text-slate-500 max-w-sm">
            An unexpected error occurred. Please try again or return home.
          </p>
          {error.digest && (
            <p className="text-xs text-slate-700 font-mono">Digest: {error.digest}</p>
          )}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-xl border border-[rgba(0,255,170,0.3)] text-[#00ffaa] hover:bg-[rgba(0,255,170,0.08)] transition-colors text-sm font-medium"
            >
              Try again
            </button>
            <a
              href={ROUTES.home}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00ffaa] to-[#00c8ff] text-[#050a18] font-semibold text-sm hover:brightness-110 transition-all"
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
