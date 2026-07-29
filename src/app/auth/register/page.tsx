/**
 * EcoLabel X — Register Page (shell)
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="glass rounded-3xl p-8 space-y-6">
      <div className="text-center">
        <h1 className="font-display font-bold text-2xl text-white mb-1">Get started free</h1>
        <p className="text-slate-500 text-sm">Create your EcoLabel X account today</p>
      </div>
      {/* Form will be implemented here */}
      <div className="h-64 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
        <p className="text-slate-600 text-sm">Register form coming soon</p>
      </div>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href={ROUTES.login} className="text-[#00ffaa] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
