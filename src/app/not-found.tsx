/**
 * EcoLabel X — Global Not Found Page
 */
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cosmos bg-grid px-4">
      <div className="text-center space-y-6">
        <p className="text-[#00ffaa] font-display font-bold text-8xl text-glow-green">404</p>
        <h1 className="font-display font-bold text-3xl text-white">Page not found</h1>
        <p className="text-slate-500 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href={ROUTES.home}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00ffaa] to-[#00c8ff] text-[#050a18] font-semibold hover:brightness-110 transition-all"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
