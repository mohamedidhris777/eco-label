/**
 * EcoLabel X — Hero Section
 *
 * Animated starfield/particle background, headline, subheadline,
 * dual CTA buttons, floating eco-score preview card, and live stats.
 */
"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

// ─── Animated Canvas Background ───────────────────────────────────────────────

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let W = 0;
    let H = 0;

    interface Particle {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
    }

    const COLORS = ["#00ffaa", "#00c8ff", "#9b59ff"];
    let particles: Particle[] = [];

    const init = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;

      const count = Math.floor((W * H) / 14000);
      particles = Array.from({ length: count }, () => ({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     Math.random() * 1.5 + 0.3,
        vx:    (Math.random() - 0.5) * 0.25,
        vy:    (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.5 + 0.15,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw connecting lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,255,170,${0.04 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color
          .replace(")", `,${p.alpha})`)
          .replace("rgb(", "rgba(")
          .replace(/^#([0-9a-f]{6})$/i, (_, hex) => {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return `rgba(${r},${g},${b},${p.alpha})`;
          });
        ctx.fill();

        // Move
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
      });

      animFrame = requestAnimationFrame(draw);
    };

    init();
    draw();

    const onResize = () => init();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}

// ─── Floating Score Preview Card ───────────────────────────────────────────────

function FloatingScoreCard() {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-5 w-64",
        "animate-float",
        "shadow-[0_24px_80px_rgba(0,0,0,0.5),0_0_40px_rgba(0,255,170,0.08)]"
      )}
      aria-label="Sample eco score card"
    >
      {/* Card header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Product</p>
          <p className="text-sm font-semibold text-white">Organic Oat Milk</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(0,255,170,0.1)] text-[#00ffaa] border border-[rgba(0,255,170,0.25)]">
          Verified
        </span>
      </div>

      {/* Score ring (CSS-only, no dependency) */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 64 64" className="-rotate-90 w-full h-full">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <circle
              cx="32" cy="32" r="26"
              fill="none"
              stroke="#00ffaa"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - 0.92)}`}
              style={{ filter: "drop-shadow(0 0 6px rgba(0,255,170,0.6))" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-bold text-lg text-[#00ffaa] leading-none">92</span>
            <span className="text-[8px] text-[#00ffaa99] uppercase tracking-widest">Plat.</span>
          </div>
        </div>
        <div className="space-y-1.5 flex-1">
          <MetricRow label="Carbon" value="1.2 kg" color="#00ffaa" pct={82} />
          <MetricRow label="Water"  value="3.1 L"  color="#00c8ff" pct={67} />
          <MetricRow label="Pack."  value="94%"    color="#9b59ff" pct={94} />
        </div>
      </div>

      {/* Labels */}
      <div className="flex gap-1.5 flex-wrap">
        {["EU Organic", "Carbon+", "Rainforest"].map((l) => (
          <span key={l} className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.05)] text-slate-400 border border-[rgba(255,255,255,0.08)]">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function MetricRow({ label, value, color, pct }: { label: string; value: string; color: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-[9px] mb-0.5">
        <span className="text-slate-500">{label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <div className="h-0.5 rounded-full bg-[rgba(255,255,255,0.06)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 4px ${color}60` }}
        />
      </div>
    </div>
  );
}

// ─── Live Stats Bar ────────────────────────────────────────────────────────────

const STATS = [
  { value: "48K+",   label: "Products Verified"   },
  { value: "2.1M",   label: "Labels Issued"        },
  { value: "340+",   label: "Brands Onboarded"     },
  { value: "99.8%",  label: "API Uptime"           },
] as const;

function StatsBar() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
      {STATS.map(({ value, label }) => (
        <div
          key={label}
          className="bg-[#050a18] px-6 py-5 flex flex-col gap-1 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
        >
          <span className="font-display font-bold text-2xl text-white">{value}</span>
          <span className="text-xs text-slate-500">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-cosmos"
      aria-labelledby="hero-headline"
    >
      {/* Animated particle canvas */}
      <ParticleCanvas />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" aria-hidden="true" />

      {/* Radial hero glow */}
      <div
        className="absolute inset-x-0 top-0 h-[70%] pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(0,255,170,0.12) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Side glows */}
      <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-[rgba(155,89,255,0.06)] blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-[rgba(0,200,255,0.06)] blur-3xl pointer-events-none" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — Copy */}
          <div className="space-y-8">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-[rgba(0,255,170,0.2)] text-sm text-[#00ffaa] animate-slide-up">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ffaa] animate-beacon flex-shrink-0" />
              <span>Sustainability Intelligence Platform</span>
              <span className="text-[#00ffaa66] text-xs">v2.0</span>
            </div>

            {/* Headline */}
            <div className="space-y-3 animate-slide-up" style={{ animationDelay: "80ms" }}>
              <h1
                id="hero-headline"
                className="font-display font-bold text-5xl sm:text-6xl xl:text-7xl text-white leading-[1.05] tracking-tight"
              >
                Know the Truth{" "}
                <br className="hidden sm:block" />
                Behind Every{" "}
                <span className="text-gradient-eco">EcoLabel</span>
              </h1>
            </div>

            {/* Subheadline */}
            <p
              className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-lg animate-slide-up"
              style={{ animationDelay: "160ms" }}
            >
              Real-time eco-label verification, carbon transparency, and
              AI-powered sustainability scoring — for every product in your
              global supply chain.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-3 animate-slide-up"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                href={ROUTES.register}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#00ffaa] to-[#00c8ff] text-[#050a18] font-semibold text-sm hover:brightness-110 hover:shadow-[0_0_32px_rgba(0,255,170,0.4)] transition-all duration-200 active:scale-[0.98]"
              >
                Start for Free
                <ArrowRightIcon />
              </Link>
              <Link
                href="#platform"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-[rgba(255,255,255,0.12)] text-slate-300 font-medium text-sm hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.22)] hover:text-white transition-all duration-200"
              >
                <PlayIcon />
                See How It Works
              </Link>
            </div>

            {/* Trust note */}
            <p className="text-xs text-slate-600 animate-slide-up" style={{ animationDelay: "300ms" }}>
              No credit card required · Free forever on 5 products · SOC 2 Type II certified
            </p>
          </div>

          {/* Right — Floating card */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute inset-0 rounded-3xl bg-[rgba(0,255,170,0.06)] blur-3xl scale-110" aria-hidden="true" />
              <FloatingScoreCard />

              {/* Secondary mini cards */}
              <div
                className="absolute -top-8 -right-12 glass rounded-xl px-3 py-2 text-xs"
                style={{ animationDelay: "1.5s" }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ffaa] animate-beacon" />
                  <span className="text-[#00ffaa] font-medium">EU Taxonomy aligned</span>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-14 glass rounded-xl px-3 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Carbon footprint</span>
                  <span className="text-[#00c8ff] font-bold">↓ 42%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-20 animate-slide-up" style={{ animationDelay: "400ms" }}>
          <StatsBar />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float pointer-events-none" aria-hidden="true">
        <span className="text-[10px] text-slate-600 uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-[rgba(0,255,170,0.4)] to-transparent" />
      </div>
    </section>
  );
}

// ─── Micro Icons ──────────────────────────────────────────────────────────────
function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <polygon points="10,8 16,12 10,16" fill="currentColor" />
    </svg>
  );
}
