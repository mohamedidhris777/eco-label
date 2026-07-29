/**
 * EcoLabel X — About Section
 *
 * Mission statement, core values grid, and a team/company callout.
 * Scroll-reveal animations via IntersectionObserver.
 */
"use client";

import { useEffect, useRef } from "react";

// ─── Value Cards ──────────────────────────────────────────────────────────────

const VALUES = [
  {
    icon:   <TransparencyIcon />,
    title:  "Radical Transparency",
    body:   "We believe every sustainability claim must be independently verifiable. No greenwashing, ever — just data.",
    color:  "#00ffaa",
  },
  {
    icon:   <ScienceIcon />,
    title:  "Science-Backed",
    body:   "Our scoring methodology is built on IPCC guidelines, GHG Protocol, and peer-reviewed LCA databases updated quarterly.",
    color:  "#9b59ff",
  },
  {
    icon:   <AccessIcon />,
    title:  "Accessible by Design",
    body:   "Sustainability intelligence shouldn't be a luxury. Our free tier gives every brand — big or small — a place to start.",
    color:  "#00c8ff",
  },
  {
    icon:   <ImpactIcon />,
    title:  "Measurable Impact",
    body:   "We track the real-world outcomes: carbon avoided, certifications achieved, and consumer trust restored.",
    color:  "#ffb300",
  },
] as const;

function ValueCard({
  icon, title, body, color, index,
}: (typeof VALUES)[number] & { index: number }) {
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
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="p-6 rounded-2xl group hover:-translate-y-1 transition-all duration-300"
      style={{
        opacity:    0,
        transform:  "translateY(24px)",
        transition: `opacity 0.55s ease ${index * 90}ms, transform 0.55s cubic-bezier(0.4,0,0.2,1) ${index * 90}ms`,
        background: "rgba(255,255,255,0.025)",
        border:     "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
        style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
      >
        {icon}
      </div>
      <h3 className="font-display font-semibold text-white text-base mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
    </div>
  );
}

// ─── Mission Block ────────────────────────────────────────────────────────────

function MissionBlock() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.style.opacity   = "1";
          el.style.transform = "translateX(0)";
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-3xl p-8 sm:p-12"
      style={{
        opacity:    0,
        transform:  "translateX(-24px)",
        transition: "opacity 0.65s ease, transform 0.65s cubic-bezier(0.4,0,0.2,1)",
        background: "linear-gradient(135deg, rgba(0,255,170,0.06) 0%, rgba(0,200,255,0.04) 50%, rgba(155,89,255,0.04) 100%)",
        border:     "1px solid rgba(0,255,170,0.12)",
      }}
    >
      {/* Decorative corner glow */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(0,255,170,0.08)" }}
        aria-hidden="true"
      />

      <div className="relative max-w-lg">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#00ffaa] mb-4 px-3 py-1 rounded-full border border-[rgba(0,255,170,0.2)] bg-[rgba(0,255,170,0.06)]">
          Our Mission
        </span>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-5 leading-tight">
          We make sustainability{" "}
          <span className="text-gradient-eco">impossible to fake</span>
        </h2>
        <p className="text-slate-400 text-lg leading-relaxed mb-6">
          Founded in 2022 by a team of climate scientists, supply-chain engineers,
          and ex-Fairtrade auditors — EcoLabel X was built because we got tired
          of seeing greenwashing go unchallenged.
        </p>
        <p className="text-slate-500 leading-relaxed">
          Today we help 340+ brands across 42 countries prove their sustainability
          claims with cryptographic certainty, automated lifecycle analysis, and
          real-time regulatory alignment.
        </p>
      </div>
    </div>
  );
}

// ─── Team / Company Numbers ────────────────────────────────────────────────────

const NUMBERS = [
  { n: "2022",  label: "Founded"        },
  { n: "42",    label: "Countries"      },
  { n: "340+",  label: "Brand Clients"  },
  { n: "400+",  label: "Certifications" },
] as const;

function CompanyNumbers() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {NUMBERS.map(({ n, label }) => (
        <div
          key={label}
          className="text-center p-6 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.02)",
            border:     "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p className="font-display font-bold text-4xl text-[#00ffaa] mb-1">{n}</p>
          <p className="text-xs text-slate-500 uppercase tracking-widest">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Section Component ─────────────────────────────────────────────────────────

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative py-28 bg-cosmos"
      aria-labelledby="about-headline"
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,200,255,0.2)] to-transparent" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Mission */}
        <MissionBlock />

        {/* Values */}
        <div>
          <h2
            id="about-headline"
            className="font-display font-bold text-3xl text-white mb-8 text-center sr-only"
          >
            Our Values
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map((v, i) => (
              <ValueCard key={v.title} {...v} index={i} />
            ))}
          </div>
        </div>

        {/* Company numbers */}
        <CompanyNumbers />
      </div>
    </section>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function TransparencyIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function ScienceIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11l-4 7h14l-4-7V3" />
    </svg>
  );
}
function AccessIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  );
}
function ImpactIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
