/**
 * EcoLabel X — Pricing Section
 *
 * Three pricing tiers with feature lists, hover effects,
 * and a "Most Popular" highlight on the Pro card.
 */
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

// ─── Plan Data ────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name:        "Starter",
    price:       "Free",
    period:      "forever",
    description: "Perfect for small brands testing the waters of sustainability.",
    accent:      "#00c8ff",
    popular:     false,
    cta:         "Start Free",
    ctaHref:     ROUTES.register,
    features: [
      "Up to 5 products",
      "Basic EcoScore calculation",
      "3 certification lookups/month",
      "PDF report exports",
      "Community support",
    ],
  },
  {
    name:        "Pro",
    price:       "$149",
    period:      "/month",
    description: "For growing brands serious about measurable sustainability.",
    accent:      "#00ffaa",
    popular:     true,
    cta:         "Start 14-day trial",
    ctaHref:     ROUTES.register,
    features: [
      "Up to 500 products",
      "AI-powered EcoScore (full model)",
      "Unlimited certification lookups",
      "Scope 1, 2 & 3 carbon tracking",
      "EU ESPR & FTC compliance engine",
      "API access (10K req/month)",
      "Custom branded reports",
      "Priority email support",
    ],
  },
  {
    name:        "Enterprise",
    price:       "Custom",
    period:      "",
    description: "For global brands and retailers with complex supply chains.",
    accent:      "#9b59ff",
    popular:     false,
    cta:         "Talk to Sales",
    ctaHref:     "#about",
    features: [
      "Unlimited products & SKUs",
      "Full supply chain mapping",
      "White-label reporting",
      "Dedicated audit trail",
      "SLA-backed API (99.9%)",
      "SSO & SCIM provisioning",
      "Custom integrations",
      "Dedicated success manager",
    ],
  },
] as const;

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  index,
}: {
  plan: (typeof PLANS)[number];
  index: number;
}) {
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
    <div
      ref={ref}
      className="relative flex flex-col rounded-2xl overflow-hidden"
      style={{
        opacity:    0,
        transform:  `translateY(${plan.popular ? 28 : 40}px)`,
        transition: `opacity 0.6s ease ${index * 100}ms, transform 0.6s cubic-bezier(0.4,0,0.2,1) ${index * 100}ms`,
        background: plan.popular
          ? `linear-gradient(160deg, rgba(0,255,170,0.07) 0%, rgba(0,200,255,0.05) 100%)`
          : "rgba(255,255,255,0.03)",
        border: plan.popular
          ? `1px solid rgba(0,255,170,0.25)`
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow: plan.popular
          ? "0 0 60px rgba(0,255,170,0.06)"
          : "none",
        marginTop: plan.popular ? undefined : "1rem",
      }}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div
          className="absolute top-0 right-0 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl text-[#050a18]"
          style={{ background: "linear-gradient(135deg, #00ffaa, #00c8ff)" }}
        >
          Most Popular
        </div>
      )}

      <div className="flex flex-col flex-1 p-7">
        {/* Header */}
        <div className="mb-7">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: plan.accent }}
          >
            {plan.name}
          </span>
          <div className="flex items-end gap-1 mt-2 mb-3">
            <span
              className="font-display font-bold text-4xl"
              style={{ color: plan.popular ? "#00ffaa" : "white" }}
            >
              {plan.price}
            </span>
            {plan.period && (
              <span className="text-slate-500 text-sm mb-1">{plan.period}</span>
            )}
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">{plan.description}</p>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8 flex-1">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-slate-400">
              <CheckIcon accent={plan.accent} />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href={plan.ctaHref}
          className="block text-center px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
          style={
            plan.popular
              ? {
                  background: "linear-gradient(135deg, #00ffaa, #00c8ff)",
                  color:      "#050a18",
                }
              : {
                  background: `${plan.accent}10`,
                  border:     `1px solid ${plan.accent}30`,
                  color:      plan.accent,
                }
          }
          onMouseEnter={(e) => {
            if (!plan.popular) {
              (e.currentTarget as HTMLAnchorElement).style.background = `${plan.accent}20`;
            }
          }}
          onMouseLeave={(e) => {
            if (!plan.popular) {
              (e.currentTarget as HTMLAnchorElement).style.background = `${plan.accent}10`;
            }
          }}
        >
          {plan.cta}
        </Link>
      </div>
    </div>
  );
}

// ─── Section Component ─────────────────────────────────────────────────────────

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative py-28 overflow-hidden"
      aria-labelledby="pricing-headline"
      style={{
        background: "linear-gradient(180deg, #050a18 0%, #060c1a 50%, #050a18 100%)",
      }}
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,170,0.15)] to-transparent" aria-hidden="true" />
      <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 max-w-xl mx-auto">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#00ffaa] mb-4 px-3 py-1 rounded-full border border-[rgba(0,255,170,0.2)] bg-[rgba(0,255,170,0.05)]">
            Pricing
          </span>
          <h2
            id="pricing-headline"
            className="font-display font-bold text-4xl sm:text-5xl text-white mb-5"
          >
            Simple, honest{" "}
            <span className="text-gradient-eco">pricing</span>
          </h2>
          <p className="text-slate-400 text-lg">
            No hidden fees. No surprise charges. Pay for what you actually use.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5 items-end">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-600 mt-10">
          All plans include a 30-day money-back guarantee. No contracts. Cancel anytime.
        </p>
      </div>
    </section>
  );
}

// ─── Check Icon ───────────────────────────────────────────────────────────────

function CheckIcon({ accent }: { accent: string }) {
  return (
    <svg
      className="w-4 h-4 flex-shrink-0 mt-0.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke={accent}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
