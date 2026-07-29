/**
 * EcoLabel X — Dashboard Upload Page
 *
 * Full-page upload module at /dashboard/upload.
 *
 * Layout:
 *  ┌─ DashboardTopNav ──────────────────────────────────────────────┐
 *  │  Page header + stats strip                                      │
 *  │  DropZone (large, with format filter tabs)                      │
 *  │  FileQueue (auto-starts, concurrent, cancel/retry per file)     │
 *  │  UploadHistory table                                            │
 *  └─────────────────────────────────────────────────────────────────┘
 */
"use client";

import { useCallback, useState } from "react";
import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";
import { DropZone }        from "@/components/upload/DropZone";
import { FileQueue }       from "@/components/upload/FileQueue";
import { UploadHistory }   from "@/components/upload/UploadHistory";
import type { UploadFile } from "@/components/upload/types";

// ─── Stats Strip ─────────────────────────────────────────────────────────────

const UPLOAD_STATS = [
  { label: "Total Uploads",   value: "2,840",  color: "#00ffaa" },
  { label: "This Month",      value: "128",    color: "#00c8ff" },
  { label: "Success Rate",    value: "98.6%",  color: "#9b59ff" },
  { label: "Avg. File Size",  value: "6.2 MB", color: "#ffb300" },
] as const;

function StatsStrip() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden bg-[rgba(255,255,255,0.06)]">
      {UPLOAD_STATS.map(({ label, value, color }) => (
        <div
          key={label}
          className="flex flex-col gap-1 px-5 py-4 bg-[#050a18] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
        >
          <span className="font-display font-bold text-2xl" style={{ color }}>{value}</span>
          <span className="text-[11px] text-slate-500">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Tips Panel ───────────────────────────────────────────────────────────────

const TIPS = [
  { icon: "📄", title: "PDF Reports",       body: "Sustainability certifications, LCA reports, and audit documents up to 50 MB."     },
  { icon: "📊", title: "CSV / Excel",       body: "Product catalogs with SKU, carbon data, ingredient lists. Up to 10 K rows."       },
  { icon: "🖼️", title: "Product Images",   body: "PNG, JPG, WebP, or SVG up to 50 MB. Used for label verification and scoring."    },
  { icon: "🔄", title: "Bulk Import",       body: "Drop multiple files at once — up to 3 uploads run in parallel automatically."    },
] as const;

function TipsPanel() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <h3 className="font-display font-semibold text-white text-sm mb-4">What can I upload?</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {TIPS.map(({ icon, title, body }) => (
          <div
            key={title}
            className="flex gap-3 p-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-lg flex-shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
            <div>
              <p className="text-xs font-semibold text-white mb-0.5">{title}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Limits note */}
      <div
        className="mt-4 flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-[11px]"
        style={{ background: "rgba(0,255,170,0.04)", border: "1px solid rgba(0,255,170,0.12)" }}
      >
        <span className="text-[#00ffaa] mt-0.5" aria-hidden="true">ℹ</span>
        <span className="text-slate-400">
          Files are queued client-side only — no data is sent to a server in this demo.
          In production, files would be streamed to your configured storage endpoint.
        </span>
      </div>
    </div>
  );
}

import { useApp } from "@/context/AppContext";

export default function UploadPage() {
  const { analyzePDF } = useApp();
  const [pendingFiles, setPendingFiles] = useState<UploadFile[]>([]);

  const handleFiles = useCallback((files: UploadFile[]) => {
    setPendingFiles(files);
    if (files.length > 0 && files[0].file) {
      analyzePDF(files[0].file);
    }
  }, [analyzePDF]);

  const handleConsumed = useCallback(() => {
    setPendingFiles([]);
  }, []);


  return (
    <>
      <DashboardTopNav
        title="Upload"
        subtitle="Import product catalogs, certifications, and sustainability reports."
      />

      <main
        id="upload-content"
        className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
      >
        {/* Stats */}
        <StatsStrip />

        {/* Two-column layout: drop zone (left) + tips (right) */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Drop zone — 2/3 width on desktop */}
          <div className="lg:col-span-2 space-y-4">
            <DropZone onFiles={handleFiles} />
            <FileQueue
              incoming={pendingFiles}
              onIncomingConsumed={handleConsumed}
            />
          </div>

          {/* Tips panel — 1/3 width on desktop */}
          <div className="lg:col-span-1">
            <TipsPanel />
          </div>
        </div>

        {/* Upload history */}
        <UploadHistory />

        <div className="h-4" aria-hidden="true" />
      </main>
    </>
  );
}
