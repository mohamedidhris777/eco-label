/**
 * EcoLabel X — Features Section
 *
 * Six feature cards arranged in a responsive grid.
 * Each card animates in via IntersectionObserver on scroll.
 */
"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

// ─── Feature Data ─────────────────────────────────────────────────────────────

interface Feature {
  icon:        React.ReactNode;
  title:       string;
  description: string;
  accent:      string;
  tag:         string;
}

const FEATURES: Feature[] = [
  {
    icon:        <ShieldCheckIcon />,
    title:       "Eco-Label Verification",
    description: "Instantly verify over 400 global sustainability certifications including EU Organic, Fairtrade, Rainforest Alliance, and Carbon Trust with cryptographic proof.",
    accent:      "#00ffaa",
    tag:         "Core",
  },
  {
    icon:        <LeafIcon />,
    title:       "Carbon Footprint Tracking",
    description: "Scope 1, 2 & 3 emissions mapped across your entire value chain — from raw materials to retail shelf. Automated LCA reports included.",
    accent:      "#00c8ff",
    tag:         "Analytics",
  },
  {
    icon:        <BrainIcon />,
    title:       "AI Sustainability Score",
    description: "Proprietary machine-learning model benchmarks products against 50+ environmental KPIs and generates a trusted 0–100 EcoScore in seconds.",
    accent:      "#9b59ff",
    tag:         "AI",
  },
  {
    icon:        <GlobeIcon />,
    title:       "Global Compliance Engine",
    description: "Stay ahead of EU ESPR, US FTC Green Guides, and 80+ regional eco-claim regulations with real-time policy monitoring and gap analysis.",
    accent:      "#ffb300",
    tag:         "Compliance",
  },
  {
    icon:        <ApiIcon />,
    title:       "Developer-First API",
    description: "REST & GraphQL APIs with webhooks, batch endpoints, and SDKs for Node, Python, and Go. Embed sustainability data anywhere in under 10 minutes.",
    accent:      "#00c8ff",
    tag:         "Integration",
  },
  {
    icon:        <ChartIcon />,
    title:       "Real-Time Dashboard",
    description: "Beautiful, live analytics dashboards for your product portfolio — trend analysis, supplier benchmarking, and board-ready ESG reporting baked in.",
    accent:      "#00ffaa",
    tag:         "Reporting",
  },
];

// ─── Feature Card ─────────────────────────────────────────────────────────────

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity    = "1";
          el.style.transform  = "translateY(0)";
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="group relative rounded-2xl p-6 overflow-hidden cursor-default"
      style={{
        opacity:    0,
        transform:  "translateY(28px)",
        transition: `opacity 0.55s ease ${index * 70}ms, transform 0.55s cubic-bezier(0.4,0,0.2,1) ${index * 70}ms`,
        background: "rgba(255,255,255,0.03)",
        border:     "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Hover glow layer */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(circle at 60% 0%, ${feature.accent}12 0%, transparent 65%)` }}
        aria-hidden="true"
      />

      {/* Accent top border */}
      <div
        className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{ background: `linear-gradient(90deg, transparent, ${feature.accent}60, transparent)` }}
        aria-hidden="true"
      />

      {/* Tag */}
      <div className="flex items-start justify-between mb-5">
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
          style={{
            background: `${feature.accent}15`,
            border:     `1px solid ${feature.accent}30`,
            color:      feature.accent,
          }}
        >
          {feature.icon}
        </div>
        <span
          className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-md"
          style={{ color: feature.accent, background: `${feature.accent}10`, border: `1px solid ${feature.accent}25` }}
        >
          {feature.tag}
        </span>
      </div>

      {/* Text */}
      <h3
        className="font-display font-semibold text-white text-lg mb-3 leading-tight"
      >
        {feature.title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed">
        {feature.description}
      </p>

      {/* Learn more link */}
      <div className="mt-5 flex items-center gap-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: feature.accent }}>
        <span>Learn more</span>
        <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

// ─── Section Component ─────────────────────────────────────────────────────────

export function FeaturesSection() {
  return (
    <section
      id="platform"
      className="relative py-28 bg-cosmos"
      aria-labelledby="features-headline"
    >
      {/* Decorative top separator */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,170,0.2)] to-transparent" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#00ffaa] mb-4 px-3 py-1 rounded-full border border-[rgba(0,255,170,0.2)] bg-[rgba(0,255,170,0.05)]">
            Platform
          </span>
          <h2
            id="features-headline"
            className="font-display font-bold text-4xl sm:text-5xl text-white mb-5"
          >
            Everything you need to{" "}
            <span className="text-gradient-eco">go green</span>, seriously
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            A single platform to verify, score, track, and report on sustainability
            — built for brands that want to be taken seriously.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ShieldCheckIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}
function LeafIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}
function BrainIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function ApiIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
