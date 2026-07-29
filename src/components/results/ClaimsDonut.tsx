/**
 * EcoLabel X — Results Module: Claims Donut Chart
 * SVG donut with animated arcs + claim list panels.
 */
"use client";

import { useEffect, useRef } from "react";
import { CATEGORY_CONFIG, type ClaimCategory } from "@/components/claims/types";
import { VERDICT_COLORS, type ClaimsData, type ClaimEntry } from "./types";

interface ClaimsDonutProps { claims: ClaimsData; }

/** Build SVG arc path for a donut segment */
function donutArc(
  cx: number, cy: number, r: number,
  startAngle: number, endAngle: number,
): string {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const sx = cx + r * Math.cos(toRad(startAngle));
  const sy = cy + r * Math.sin(toRad(startAngle));
  const ex = cx + r * Math.cos(toRad(endAngle));
  const ey = cy + r * Math.sin(toRad(endAngle));
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
}

interface DonutSegmentProps {
  path:    string;
  color:   string;
  delay:   number;
}

function DonutSegment({ path, color, delay }: DonutSegmentProps) {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const len = el.getTotalLength?.() ?? 200;
    el.style.strokeDasharray  = String(len);
    el.style.strokeDashoffset = String(len);
    const t = setTimeout(() => {
      el.style.transition       = `stroke-dashoffset 0.9s cubic-bezier(.4,0,.2,1) ${delay}ms`;
      el.style.strokeDashoffset = "0";
    }, 50);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <path ref={ref} d={path} fill="none" stroke={color} strokeWidth={14}
      strokeLinecap="butt"
      style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
    />
  );
}

export function ClaimsDonut({ claims }: ClaimsDonutProps) {
  const { total, verified, partially_verified, not_verified } = claims;
  const CX = 70; const CY = 70; const R = 50;

  let angle = 0;
  const GAP = 4;
  const segments: { path: string; color: string; label: string; count: number; delay: number }[] = [];

  const data = [
    { key: "verified"           as const, count: verified,           color: "#00ffaa", label: "Verified",     delay: 0   },
    { key: "partially_verified" as const, count: partially_verified, color: "#ffb300", label: "Partial",      delay: 150 },
    { key: "not_verified"       as const, count: not_verified,       color: "#ef4444", label: "Not Verified", delay: 300 },
  ];

  for (const d of data) {
    const span = (d.count / total) * 360 - GAP;
    if (span > 0) {
      segments.push({ path: donutArc(CX, CY, R, angle, angle + span), color: d.color, label: d.label, count: d.count, delay: d.delay });
    }
    angle += (d.count / total) * 360;
  }

  return (
    <div className="space-y-5">
      {/* Donut + legend */}
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 140 140" className="w-32 h-32 flex-shrink-0" aria-label="Claims distribution donut chart">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={14} />
          {segments.map((s, i) => (
            <DonutSegment key={i} path={s.path} color={s.color} delay={s.delay} />
          ))}
          {/* Centre */}
          <text x={CX} y={CY - 5} textAnchor="middle" fill="white"
            fontSize={22} fontWeight={800} fontFamily="sans-serif">{total}</text>
          <text x={CX} y={CY + 12} textAnchor="middle" fill="#64748b" fontSize={9}>claims</text>
        </svg>

        <div className="space-y-2.5">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="text-[11px] text-slate-400">{s.label}</span>
              <span className="text-[13px] font-bold tabular-nums ml-auto" style={{ color: s.color }}>{s.count}</span>
            </div>
          ))}
          <div className="flex items-center gap-2.5 pt-1 border-t border-white/5">
            <span className="text-[10px] text-slate-600">Avg confidence</span>
            <span className="text-[11px] font-bold text-slate-400 ml-auto">
              {Math.round(([...claims.verified_list, ...claims.rejected_list]
                .reduce((s, c) => s + c.confidence, 0) /
                (claims.verified_list.length + claims.rejected_list.length || 1)) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Claim panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ClaimPanel title="Verified Claims" items={claims.verified_list.slice(0, 4)} verdict="verified" />
        <ClaimPanel title="Rejected Claims" items={claims.rejected_list.slice(0, 4)} verdict="not_verified" />
      </div>
    </div>
  );
}

function getCatCfg(cat: string) {
  return CATEGORY_CONFIG[cat as ClaimCategory] ?? { icon: "🌍", label: cat, color: "#94a3b8" };
}

function ClaimPanel({ title, items, verdict }: {
  title: string; items: ClaimEntry[]; verdict: "verified" | "not_verified";
}) {
  const vc = VERDICT_COLORS[verdict];
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${vc.border}` }}>
      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest"
           style={{ background: vc.bg, color: vc.color }}>
        {vc.icon} {title}
      </div>
      <div className="divide-y divide-white/5">
        {items.map((item) => {
          const cat = getCatCfg(item.category);
          return (
            <div key={item.id} className="px-3 py-2.5 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px]" aria-hidden="true">{cat.icon}</span>
                <span className="text-[9px] text-slate-600 capitalize">{cat.label}</span>
                <span className="ml-auto text-[9px] font-bold tabular-nums" style={{ color: vc.color }}>
                  pg {item.page}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{item.text}</p>
              {item.evidence && (
                <p className="text-[10px] text-slate-600 italic leading-snug line-clamp-1 border-l-2 pl-2"
                   style={{ borderColor: vc.color + "40" }}>
                  {item.evidence}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
