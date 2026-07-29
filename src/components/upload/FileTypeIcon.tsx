/**
 * EcoLabel X — Upload Module: File Type Icons
 *
 * Coloured icon tiles per file type, used in drop zone and queue rows.
 */
import type { AcceptedFileType } from "./types";

interface FileTypeIconProps {
  type:      AcceptedFileType;
  size?:     "sm" | "md" | "lg";
  className?: string;
}

const TYPE_CONFIG: Record<
  AcceptedFileType,
  { color: string; bg: string; border: string; label: string; icon: React.ReactNode }
> = {
  pdf: {
    color:  "#ef4444",
    bg:     "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.25)",
    label:  "PDF",
    icon:   <PdfSvg />,
  },
  csv: {
    color:  "#00ffaa",
    bg:     "rgba(0,255,170,0.1)",
    border: "rgba(0,255,170,0.25)",
    label:  "CSV",
    icon:   <CsvSvg />,
  },
  excel: {
    color:  "#22c55e",
    bg:     "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.25)",
    label:  "XLS",
    icon:   <ExcelSvg />,
  },
  image: {
    color:  "#9b59ff",
    bg:     "rgba(155,89,255,0.1)",
    border: "rgba(155,89,255,0.25)",
    label:  "IMG",
    icon:   <ImageSvg />,
  },
  other: {
    color:  "#64748b",
    bg:     "rgba(100,116,139,0.1)",
    border: "rgba(100,116,139,0.25)",
    label:  "FILE",
    icon:   <FileSvg />,
  },
};

const SIZE_MAP = {
  sm: { tile: 32, icon: "w-3.5 h-3.5" },
  md: { tile: 40, icon: "w-4 h-4"     },
  lg: { tile: 56, icon: "w-6 h-6"     },
};

export function FileTypeIcon({ type, size = "md", className = "" }: FileTypeIconProps) {
  const cfg = TYPE_CONFIG[type];
  const sz  = SIZE_MAP[size];

  return (
    <div
      className={`flex-shrink-0 rounded-xl flex items-center justify-center ${className}`}
      style={{
        width:      sz.tile,
        height:     sz.tile,
        background: cfg.bg,
        border:     `1px solid ${cfg.border}`,
        color:      cfg.color,
      }}
      aria-label={`${cfg.label} file`}
    >
      <span className={sz.icon}>{cfg.icon}</span>
    </div>
  );
}

export function fileTypeColor(type: AcceptedFileType): string {
  return TYPE_CONFIG[type].color;
}

// ─── SVG icons ────────────────────────────────────────────────────────────────

function PdfSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="12" y2="17" />
      <path d="M9 9h1a2 2 0 0 1 0 4H9V9z" />
    </svg>
  );
}
function CsvSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
      <line x1="8" y1="9"  x2="10" y2="9"  />
    </svg>
  );
}
function ExcelSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9"  y1="10" x2="15" y2="16" />
      <line x1="15" y1="10" x2="9"  y2="16" />
    </svg>
  );
}
function ImageSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
function FileSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
