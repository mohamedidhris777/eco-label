/**
 * EcoLabel X — Social Proof / Trust Section
 *
 * Animated logo ticker + certification badges + testimonial quote.
 * All purely CSS-animated — zero dependencies.
 */
"use client";

// ─── Brand Logo Ticker ────────────────────────────────────────────────────────

const BRAND_NAMES = [
  "Nestlé",
  "Unilever",
  "Patagonia",
  "IKEA",
  "Oatly",
  "Allbirds",
  "The Body Shop",
  "Ben & Jerry's",
  "Method",
  "Seventh Gen",
] as const;

function LogoTicker() {
  // Duplicate for seamless loop
  const doubled = [...BRAND_NAMES, ...BRAND_NAMES];

  return (
    <div className="relative overflow-hidden" aria-label="Trusted by leading brands">
      {/* Fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, #050a18, transparent)" }} aria-hidden="true" />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: "linear-gradient(-90deg, #050a18, transparent)" }} aria-hidden="true" />

      <div
        className="flex gap-12 whitespace-nowrap"
        style={{
          animation:       "ticker 28s linear infinite",
          willChange:      "transform",
          display:         "flex",
          alignItems:      "center",
        }}
      >
        {doubled.map((name, i) => (
          <div
            key={`${name}-${i}`}
            className="flex-shrink-0 px-6 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] text-slate-500 text-sm font-medium hover:text-slate-300 hover:border-[rgba(255,255,255,0.14)] transition-all duration-300 cursor-default"
          >
            {name}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ─── Certification Badges ─────────────────────────────────────────────────────

const CERTS = [
  { name: "ISO 14064",       color: "#00ffaa", desc: "GHG Verified"          },
  { name: "EU Organic",      color: "#00c8ff", desc: "Regulation 2018/848"   },
  { name: "Rainforest",      color: "#00ffaa", desc: "Alliance Certified"    },
  { name: "Fairtrade",       color: "#ffb300", desc: "International"         },
  { name: "Carbon Trust",    color: "#9b59ff", desc: "Footprint Certified"   },
  { name: "B Corp",          color: "#00c8ff", desc: "Benefit Corporation"   },
] as const;

function CertBadges() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {CERTS.map(({ name, color, desc }) => (
        <div
          key={name}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl group hover:-translate-y-0.5 transition-all duration-200"
          style={{
            background: `${color}08`,
            border:     `1px solid ${color}22`,
          }}
        >
          {/* Badge icon circle */}
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold"
            style={{ background: `${color}20`, color }}
          >
            ✓
          </div>
          <div>
            <p className="text-xs font-semibold text-white leading-none">{name}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Testimonial ──────────────────────────────────────────────────────────────

function Testimonial() {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="glass rounded-3xl p-8 sm:p-10 relative overflow-hidden">
        {/* Quote glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-16 bg-[rgba(0,255,170,0.06)] blur-2xl pointer-events-none" aria-hidden="true" />

        {/* Quote mark */}
        <div className="text-6xl font-display text-[rgba(0,255,170,0.2)] leading-none mb-4 select-none" aria-hidden="true">&#8220;</div>

        <blockquote className="text-lg sm:text-xl text-white font-medium leading-relaxed mb-6">
          EcoLabel X cut our sustainability reporting time from 6 weeks to 2 days.
          The AI scoring is scarily accurate — our third-party auditors now ask us
          to share it with them.
        </blockquote>

        <div className="flex items-center justify-center gap-3">
          {/* Avatar placeholder */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ffaa] to-[#00c8ff] flex items-center justify-center text-sm font-bold text-[#050a18] flex-shrink-0">
            SL
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Sophie Laurent</p>
            <p className="text-xs text-slate-500">VP Sustainability, Verdant Foods Group</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section Component ─────────────────────────────────────────────────────────

export function SocialProofSection() {
  return (
    <section
      className="relative py-20 bg-cosmos overflow-hidden"
      aria-label="Trusted by leading brands"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Label */}
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-600">
          Trusted by 340+ brands worldwide
        </p>

        {/* Logo ticker */}
        <LogoTicker />

        {/* Cert badges */}
        <div>
          <p className="text-center text-xs text-slate-600 mb-5 uppercase tracking-widest">
            Supported certifications &amp; standards
          </p>
          <CertBadges />
        </div>

        {/* Testimonial */}
        <Testimonial />
      </div>
    </section>
  );
}
