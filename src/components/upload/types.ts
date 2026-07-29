/**
 * EcoLabel X — Upload Module: Shared Types
 *
 * Shared type definitions used across all upload components.
 */

export type FileStatus =
  | "queued"
  | "validating"
  | "uploading"
  | "success"
  | "error";

export type AcceptedFileType = "pdf" | "csv" | "excel" | "image" | "other";

export interface UploadFile {
  id:        string;
  file:      File;
  type:      AcceptedFileType;
  status:    FileStatus;
  progress:  number;        // 0–100
  error?:    string;
  sizeLabel: string;        // e.g. "2.4 MB"
  addedAt:   number;        // Date.now()
}

export type QueueAction =
  | { type: "ADD";      files: UploadFile[] }
  | { type: "PROGRESS"; id: string; progress: number }
  | { type: "STATUS";   id: string; status: FileStatus; error?: string }
  | { type: "CANCEL";   id: string }
  | { type: "RETRY";    id: string }
  | { type: "CLEAR_DONE" };

// ─── Accepted MIME types grouped by category ──────────────────────────────────

export const ACCEPTED_TYPES: Record<AcceptedFileType, string[]> = {
  pdf:   ["application/pdf"],
  csv:   ["text/csv", "text/plain"],
  excel: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  image: ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"],
  other: [],
};

export const ACCEPTED_EXTENSIONS =
  ".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.webp,.gif,.svg";

export const MAX_FILE_SIZE_MB = 50;

// ─── Helper: resolve file category ────────────────────────────────────────────

export function resolveFileType(file: File): AcceptedFileType {
  const mime = file.type.toLowerCase();
  if (ACCEPTED_TYPES.pdf.includes(mime))   return "pdf";
  if (ACCEPTED_TYPES.csv.includes(mime))   return "csv";
  if (ACCEPTED_TYPES.excel.includes(mime)) return "excel";
  if (ACCEPTED_TYPES.image.includes(mime)) return "image";
  // Fallback: check extension
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf")  return "pdf";
  if (ext === "csv")  return "csv";
  if (["xlsx", "xls"].includes(ext)) return "excel";
  if (["png","jpg","jpeg","webp","gif","svg"].includes(ext)) return "image";
  return "other";
}

// ─── Helper: format bytes ─────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

// ─── Helper: validate a file before queuing ───────────────────────────────────

export function validateFile(file: File): string | null {
  const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File exceeds ${MAX_FILE_SIZE_MB} MB limit (${formatBytes(file.size)})`;
  }
  const type = resolveFileType(file);
  if (type === "other") {
    return `Unsupported format. Accepted: PDF, CSV, Excel, PNG/JPG/WebP`;
  }
  return null;
}
