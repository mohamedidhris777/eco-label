/**
 * EcoLabel X — Verification Module: Evidence Card
 * Displays a single supporting evidence passage.
 */
"use client";

import { EVIDENCE_TYPE_LABELS, type EvidencePassage } from "./types";

interface EvidenceCardProps {
  evidence: EvidencePassage;
  index:    number;
}

export function EvidenceCard({ evidence, index }: EvidenceCardProps) {
  const typeInfo = EVIDENCE_TYPE_LABELS[evidence.evidence_type];
  const pct      = Math.round(evidence.relevance_score * 100);

  const scoreColor =
    pct >= 70 ? "#00ffaa" :
    pct >= 45 ? "#ffb300" :
                "#94a3b8";

  return (
    <div
      className="rounded-xl p-3 space-y-2"
      style={{
        background: "rgba(255,255,255,0.03)",
        border:     "1px solid rgba(255,255,255,0.07)",
      }}
      aria-label={`Evidence ${index + 1}: ${typeInfo.label}`}
    >
      {/* Row: type badge + page + relevance */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold text-slate-400"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span aria-hidden="true">{typeInfo.icon}</span>
          {typeInfo.label}
        </span>

        <span className="text-[9px] text-slate-600">
          Page {evidence.page}
        </span>

        <span
          className="ml-auto text-[10px] font-bold tabular-nums"
          style={{ color: scoreColor }}
          title={`Relevance score: ${pct}%`}
        >
          {pct}% match
        </span>
      </div>

      {/* Evidence text */}
      <p className="text-[12px] text-slate-400 leading-relaxed italic border-l-2 pl-3"
         style={{ borderColor: scoreColor + "50" }}>
        &ldquo;{evidence.text}&rdquo;
      </p>
    </div>
  );
}
