/**
 * EcoLabel X — CTA Section
 *
 * Bottom-of-page conversion block with gradient glow background,
 * headline, dual CTAs, and a soft newsletter opt-in.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

// ─── Newsletter Input ─────────────────────────────────────────────────────────

function NewsletterInput() {
  const [email,     setEmail]     = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Simulate async without a backend
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setEmail("");
    }, 900);
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center gap-2.5 h-12 text-sm text-[#00ffaa] animate-slide-up">
        <span className="w-5 h-5 rounded-full bg-[rgba(0,255,170,0.15)] border border-[rgba(0,255,170,0.3)] flex items-center justify-center text-xs">✓</span>
        <span>You&apos;re on the list — we&apos;ll be in touch!</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
      aria-label="Newsletter signup"
    >
      <label htmlFor="cta-email" className="sr-only">
        Your email address
      </label>
      <input
        id="cta-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@brand.com"
        required
        className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.05)",
          border:     "1px solid rgba(255,255,255,0.12)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.border      = "1px solid rgba(0,255,170,0.4)";
          e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(0,255,170,0.08)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.border      = "1px solid rgba(255,255,255,0.12)";
          e.currentTarget.style.boxShadow   = "none";
        }}
      />
      <button
        type="submit"
        disabled={loading}
        className="px-5 py-3 rounded-xl text-sm font-semibold text-[#050a18] transition-all duration-200 disabled:opacity-60 flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #00ffaa, #00c8ff)",
        }}
      >
        {loading ? "Joining…" : "Get Updates"}
      </button>
    </form>
  );
}

// ─── Section Component ─────────────────────────────────────────────────────────

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.style.opacity   = "1";
          el.style.transform = "translateY(0)";
          obs.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      className="relative py-28 overflow-hidden bg-cosmos"
      aria-labelledby="cta-headline"
    >
      {/* Top separator */}
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(155,89,255,0.3), transparent)" }}
        aria-hidden="true"
      />

      {/* Large ambient glow */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-96 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 100% at 50% 50%, rgba(0,255,170,0.05) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Rotating ring decoration */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[rgba(0,255,170,0.04)] animate-spin-slow pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[rgba(0,200,255,0.04)] animate-spin-slow pointer-events-none"
        style={{ animationDirection: "reverse", animationDuration: "18s" }}
        aria-hidden="true"
      />

      <div
        ref={ref}
        className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        style={{
          opacity:    0,
          transform:  "translateY(28px)",
          transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(0,255,170,0.2)] bg-[rgba(0,255,170,0.05)] text-sm text-[#00ffaa] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ffaa] animate-beacon" />
          Free to start. No card required.
        </div>

        {/* Headline */}
        <h2
          id="cta-headline"
          className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6"
        >
          Ready to prove your{" "}
          <span className="text-gradient-eco">sustainability</span>?
        </h2>

        {/* Sub */}
        <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-xl mx-auto">
          Join 340+ brands who have stopped guessing and started knowing.
          Your first 5 products are always free.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link
            href={ROUTES.register}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold text-[#050a18] transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_40px_rgba(0,255,170,0.35)] active:scale-[0.98] w-full sm:w-auto justify-center"
            style={{ background: "linear-gradient(135deg, #00ffaa, #00c8ff)" }}
          >
            Start for free
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href={ROUTES.login}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-medium text-slate-300 border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:text-white transition-all duration-200 w-full sm:w-auto justify-center"
          >
            Sign in to dashboard
          </Link>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
          <span className="text-xs text-slate-600 uppercase tracking-widest">or stay in the loop</span>
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
        </div>

        {/* Newsletter */}
        <NewsletterInput />

        {/* Fine print */}
        <p className="text-xs text-slate-700 mt-4">
          Monthly sustainability insights. Unsubscribe any time.
        </p>
      </div>
    </section>
  );
}
