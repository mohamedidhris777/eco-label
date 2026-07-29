/**
 * EcoLabel X — Login Page (shell)
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="glass rounded-3xl p-8 space-y-6">
      <div className="text-center">
        <h1 className="font-display font-bold text-2xl text-white mb-1">Welcome back</h1>
        <p className="text-slate-500 text-sm">Sign in to your EcoLabel X account</p>
      </div>
      {/* Form will be implemented here */}
      <div className="h-48 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
        <p className="text-slate-600 text-sm">Login form coming soon</p>
      </div>
      <p className="text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href={ROUTES.register} className="text-[#00ffaa] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
