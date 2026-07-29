/**
 * EcoLabel X — How It Works Section
 *
 * Three-step process with animated connector lines, icons, and scroll reveal.
 */
"use client";

import { useEffect, useRef } from "react";

// ─── Step Data ────────────────────────────────────────────────────────────────

const STEPS = [
  {
    step:        "01",
    title:       "Connect Your Products",
    description: "Import your product catalog via CSV, our REST API, or native integrations with Shopify, SAP, and 30+ platforms. Takes under 5 minutes.",
    accent:      "#00ffaa",
    icon:        <ConnectIcon />,
    detail:      "Supports 10,000+ SKUs per import",
  },
  {
    step:        "02",
    title:       "Analyse & Verify",
    description: "Our AI engine cross-references each product against 400+ certification databases, lifecycle data, and supply chain disclosures in real time.",
    accent:      "#9b59ff",
    icon:        <ScanIcon />,
    detail:      "Results in under 3 seconds",
  },
  {
    step:        "03",
    title:       "Report & Communicate",
    description: "Generate board-ready ESG reports, consumer-facing QR labels, and regulatory compliance filings — all from one unified dashboard.",
    accent:      "#00c8ff",
    icon:        <ReportIcon />,
    detail:      "50+ report templates included",
  },
] as const;

// ─── Step Card ────────────────────────────────────────────────────────────────

function StepCard({
  step,
  title,
  description,
  accent,
  icon,
  detail,
  index,
}: (typeof STEPS)[number] & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity   = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative flex flex-col"
      style={{
        opacity:    0,
        transform:  "translateY(32px)",
        transition: `opacity 0.6s ease ${index * 120}ms, transform 0.6s cubic-bezier(0.4,0,0.2,1) ${index * 120}ms`,
      }}
    >
      {/* Step number */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}15`, border: `1px solid ${accent}35`, color: accent }}
        >
          {icon}
        </div>
        <span
          className="font-display font-bold text-5xl leading-none select-none"
          style={{ color: `${accent}18` }}
          aria-hidden="true"
        >
          {step}
        </span>
      </div>

      {/* Card body */}
      <div
        className="flex-1 rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
        style={{
          background: "rgba(255,255,255,0.025)",
          border:     "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Corner glow on hover */}
        <div
          className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: `${accent}20`, transform: "translate(30%, -30%)" }}
          aria-hidden="true"
        />

        <h3 className="font-display font-semibold text-white text-xl mb-3">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-4">{description}</p>

        {/* Detail chip */}
        <div
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
          style={{ color: accent, background: `${accent}10`, border: `1px solid ${accent}25` }}
        >
          <span className="w-1 h-1 rounded-full" style={{ background: accent }} />
          {detail}
        </div>
      </div>
    </div>
  );
}

// ─── Section Component ─────────────────────────────────────────────────────────

export function HowItWorksSection() {
  return (
    <section
      id="solutions"
      className="relative py-28 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #050a18 0%, #080d1e 50%, #050a18 100%)" }}
      aria-labelledby="how-it-works-headline"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-dots opacity-30 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[rgba(155,89,255,0.3)] to-transparent" aria-hidden="true" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,200,255,0.2)] to-transparent" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-xl mx-auto">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#9b59ff] mb-4 px-3 py-1 rounded-full border border-[rgba(155,89,255,0.25)] bg-[rgba(155,89,255,0.06)]">
            How It Works
          </span>
          <h2
            id="how-it-works-headline"
            className="font-display font-bold text-4xl sm:text-5xl text-white mb-5"
          >
            From catalog to{" "}
            <span className="text-gradient-brand">certified</span>{" "}
            in minutes
          </h2>
          <p className="text-slate-400 text-lg">
            A frictionless three-step workflow designed for speed without compromising accuracy.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-10 relative">
          {/* Connector line (desktop) */}
          <div
            className="hidden md:block absolute top-6 left-[calc(33.33%+24px)] right-[calc(33.33%+24px)] h-px"
            style={{ background: "linear-gradient(90deg, rgba(0,255,170,0.25), rgba(155,89,255,0.25), rgba(0,200,255,0.25))" }}
            aria-hidden="true"
          />

          {STEPS.map((step, i) => (
            <StepCard key={step.step} {...step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ConnectIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="8" height="8" rx="2" />
      <rect x="14" y="2" width="8" height="8" rx="2" />
      <rect x="2" y="14" width="8" height="8" rx="2" />
      <path d="M18 14v4M20 16h-4M10 6h4M10 18h2a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}
function ScanIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}
function ReportIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
