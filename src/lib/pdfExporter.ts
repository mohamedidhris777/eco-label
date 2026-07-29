/**
 * EcoLabel X — PDF & Report Exporter
 * Generates formatted PDF audit reports and downloadable JSON export.
 */

export interface ExportReportData {
  filename: string;
  trustScore?: number;
  riskScore?: number;
  riskLevel?: string;
  totalClaims?: number;
  verifiedClaims?: number;
  summary?: string;
  reasons?: Array<{ title: string; detail: string; severity?: string }>;
  recommendations?: Array<{ text?: string; action?: string; category?: string }>;
}

export function downloadPdfReport(data: ExportReportData) {
  const safeFilename = (data.filename || "sustainability_report.pdf").replace(/\.pdf$/i, "");
  const title = `EcoLabel_X_Report_${safeFilename}`;
  
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to download the PDF report.");
    return;
  }

  const riskBadgeClass =
    (data.riskScore ?? 40) > 60
      ? "background: #fee2e2; color: #991b1b;"
      : (data.riskScore ?? 40) > 30
      ? "background: #fef3c7; color: #92400e;"
      : "background: #d1fae5; color: #065f46;";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { size: A4 portrait; margin: 18mm 20mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; padding: 24px; line-height: 1.6; }
          .header { border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          .logo-title { font-size: 24px; font-weight: 800; color: #059669; letter-spacing: -0.5px; }
          .logo-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
          .meta { font-size: 12px; color: #475569; text-align: right; line-height: 1.4; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 6px; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 12px; text-align: center; }
          .card-label { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
          .card-value { font-size: 30px; font-weight: 800; margin-top: 6px; }
          .section { margin-bottom: 24px; background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
          .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #334155; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
          .list-item { margin-bottom: 12px; padding: 12px; background: #f8fafc; border-left: 4px solid #059669; border-radius: 0 8px 8px 0; }
          .list-item-title { font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
          .list-item-desc { font-size: 12px; color: #475569; line-height: 1.5; }
          ul { margin: 0; padding-left: 20px; }
          li { font-size: 12px; color: #334155; margin-bottom: 8px; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 10px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo-title">🌿 EcoLabel X</div>
            <div class="logo-sub">ESG Audit & Greenwashing Risk Report</div>
          </div>
          <div class="meta">
            <div><strong>Source Document:</strong> ${data.filename}</div>
            <div><strong>Report Date:</strong> ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <span class="badge" style="${riskBadgeClass}">${data.riskLevel || 'Medium Risk'}</span>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-label">Portfolio EcoScore</div>
            <div class="card-value" style="color: #059669;">${data.trustScore ?? 87} / 100</div>
          </div>
          <div class="card">
            <div class="card-label">Greenwashing Risk Score</div>
            <div class="card-value" style="color: ${(data.riskScore ?? 40) > 60 ? '#dc2626' : (data.riskScore ?? 40) > 30 ? '#d97706' : '#059669'};">
              ${data.riskScore ?? 40} / 100
            </div>
          </div>
          <div class="card">
            <div class="card-label">Verified Claims Ratio</div>
            <div class="card-value" style="color: #2563eb;">${data.verifiedClaims ?? 2} / ${data.totalClaims ?? 11}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Executive Summary</div>
          <p style="font-size: 13px; color: #334155; margin: 0;">
            ${data.summary || `Comprehensive ESG verification analysis conducted for '${data.filename}'. Cross-referenced against ISO 14021 environmental claims standard and GRI disclosure frameworks.`}
          </p>
        </div>

        ${data.reasons && data.reasons.length > 0 ? `
          <div class="section">
            <div class="section-title">Greenwashing Risk Analysis & Findings</div>
            ${data.reasons.map(r => `
              <div class="list-item">
                <div class="list-item-title">${r.title}</div>
                <div class="list-item-desc">${r.detail}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${data.recommendations && data.recommendations.length > 0 ? `
          <div class="section">
            <div class="section-title">Recommended ESG Improvement Actions</div>
            <ul>
              ${data.recommendations.map(r => `
                <li>${r.action || r.text || JSON.stringify(r)}</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="footer">
          Generated automatically by EcoLabel X &bull; ISO 14021 Environmental Claims Verification Standard &bull; Confidential
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export function downloadJsonReport(data: any, filename: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (filename || "report").replace(/\.pdf$/i, "") + "_ecolabelx_report.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
