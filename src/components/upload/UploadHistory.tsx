/**
 * EcoLabel X — Upload Module: Upload History
 *
 * Table of previously completed uploads (mock data).
 * Shows file name, type icon, date, size, and status.
 */
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { FileTypeIcon } from "./FileTypeIcon";
import type { AcceptedFileType } from "./types";

// ─── Mock history data ────────────────────────────────────────────────────────

interface HistoryItem {
  id:        string;
  name:      string;
  type:      AcceptedFileType;
  size:      string;
  rows?:     number;
  uploadedAt: string;
  status:    "success" | "error";
  error?:    string;
}

const HISTORY: HistoryItem[] = [
  { id: "h1",  name: "q2_product_catalog.csv",         type: "csv",   size: "4.2 MB",  rows: 1240, uploadedAt: "Today, 11:42 AM", status: "success" },
  { id: "h2",  name: "eu_organic_cert_bundle.pdf",     type: "pdf",   size: "12.1 MB",             uploadedAt: "Today, 10:18 AM", status: "success" },
  { id: "h3",  name: "product_photos_batch_07.png",    type: "image", size: "8.7 MB",              uploadedAt: "Today, 09:55 AM", status: "success" },
  { id: "h4",  name: "supply_chain_report_2026.xlsx",  type: "excel", size: "3.4 MB",  rows: 540,  uploadedAt: "Yesterday",       status: "success" },
  { id: "h5",  name: "fairtrade_certificate.pdf",      type: "pdf",   size: "1.1 MB",              uploadedAt: "Yesterday",       status: "error", error: "Corrupted PDF — could not parse pages" },
  { id: "h6",  name: "carbon_audit_h1_2026.xlsx",      type: "excel", size: "2.8 MB",  rows: 320,  uploadedAt: "Jul 27",          status: "success" },
  { id: "h7",  name: "logo_assets_hi_res.png",         type: "image", size: "22.4 MB",             uploadedAt: "Jul 27",          status: "success" },
  { id: "h8",  name: "ingredients_database_v4.csv",    type: "csv",   size: "9.6 MB",  rows: 4820, uploadedAt: "Jul 25",          status: "success" },
];

const PAGE_SIZE = 6;

// ─── Row ─────────────────────────────────────────────────────────────────────

function HistoryRow({ item }: { item: HistoryItem }) {
  return (
    <tr
      className="group border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
    >
      {/* File */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <FileTypeIcon type={item.type} size="sm" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate max-w-[220px]">{item.name}</p>
            {item.rows !== undefined && (
              <p className="text-[10px] text-slate-600 mt-0.5">{item.rows.toLocaleString()} rows</p>
            )}
          </div>
        </div>
      </td>

      {/* Size */}
      <td className="py-3 px-4 hidden sm:table-cell">
        <span className="text-xs text-slate-500">{item.size}</span>
      </td>

      {/* Date */}
      <td className="py-3 px-4 hidden md:table-cell">
        <span className="text-[11px] text-slate-500">{item.uploadedAt}</span>
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        {item.status === "success" ? (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ color: "#00ffaa", background: "rgba(0,255,170,0.1)" }}
          >
            <span className="w-1 h-1 rounded-full bg-[#00ffaa]" aria-hidden="true" />
            Uploaded
          </span>
        ) : (
          <div>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)" }}
            >
              <span className="w-1 h-1 rounded-full bg-[#ef4444]" aria-hidden="true" />
              Failed
            </span>
            {item.error && (
              <p className="text-[10px] text-red-400 mt-0.5 max-w-[200px]">{item.error}</p>
            )}
          </div>
        )}
      </td>

      {/* Actions */}
      <td className="py-3 px-4">
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="text-[11px] text-slate-500 hover:text-white transition-colors"
            aria-label={`Download ${item.name}`}
          >
            ↓ Download
          </button>
          {item.status === "error" && (
            <button
              className="text-[11px] text-[#00c8ff] hover:underline"
              aria-label={`Retry ${item.name}`}
            >
              Retry
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UploadHistory() {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(HISTORY.length / PAGE_SIZE);
  const rows = HISTORY.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <section aria-labelledby="history-heading">
      <div className="flex items-center justify-between mb-4">
        <h2
          id="history-heading"
          className="font-display font-semibold text-white text-sm"
        >
          Upload History
          <span className="ml-2 text-xs font-normal text-slate-500">
            {HISTORY.length} files
          </span>
        </h2>
        <div className="flex gap-3">
          <button className="text-[11px] text-slate-500 hover:text-white transition-colors">
            Export log
          </button>
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Upload history">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                {[
                  { label: "File",     cls: "" },
                  { label: "Size",     cls: "hidden sm:table-cell" },
                  { label: "Uploaded", cls: "hidden md:table-cell" },
                  { label: "Status",   cls: "" },
                  { label: "",         cls: "" },
                ].map(({ label, cls }) => (
                  <th
                    key={label || "act"}
                    className={cn(
                      "py-3 px-4 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap",
                      cls
                    )}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <HistoryRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(255,255,255,0.06)]">
            <p className="text-[10px] text-slate-600">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, HISTORY.length)} of{" "}
              {HISTORY.length}
            </p>
            <div className="flex gap-1">
              <PagBtn
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                aria-label="Previous page"
              >
                ‹
              </PagBtn>
              {Array.from({ length: totalPages }, (_, i) => (
                <PagBtn
                  key={i}
                  active={i === page}
                  onClick={() => setPage(i)}
                  aria-current={i === page ? "page" : undefined}
                >
                  {i + 1}
                </PagBtn>
              ))}
              <PagBtn
                disabled={page === totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                aria-label="Next page"
              >
                ›
              </PagBtn>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Pagination button ────────────────────────────────────────────────────────

function PagBtn({
  children, disabled, active, onClick, "aria-label": ariaLabel, "aria-current": ariaCurrent,
}: {
  children:       React.ReactNode;
  disabled?:      boolean;
  active?:        boolean;
  onClick:        () => void;
  "aria-label"?:  string;
  "aria-current"?: "page" | undefined;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      className={cn(
        "w-7 h-7 rounded-lg text-[11px] font-medium transition-all",
        active
          ? "bg-[rgba(0,255,170,0.12)] text-[#00ffaa] border border-[rgba(0,255,170,0.25)]"
          : "text-slate-500 hover:text-white hover:bg-[rgba(255,255,255,0.06)]",
        disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}
