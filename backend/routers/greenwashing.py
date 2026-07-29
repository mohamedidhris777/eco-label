"""
EcoLabel X — Greenwashing Router
POST /api/greenwashing/pdf     — upload PDF; full pipeline (extract→detect→verify→analyze)
POST /api/greenwashing/analyze — JSON body with pre-verified results
"""
from __future__ import annotations
import logging

from fastapi import APIRouter, Body, File, HTTPException, UploadFile, status

from models.greenwashing_schemas import (
    AnalyzeClaimsRequest, AnalyzeClaimsResponse,
    AnalyzePDFResponse, ClaimBreakdown, GreenwashingReport,
    GreenwashingReason, MissingEvidence, Recommendation, ReportFlags,
)
from models.schemas                import ErrorResponse
from services.text_extractor       import extract_text, extract_metadata
from services.claim_detector       import detect_claims
from services.evidence_verifier    import verify_claims
from services.greenwashing_analyzer import analyze_greenwashing

logger    = logging.getLogger("ecolabelx.router.greenwashing")
router    = APIRouter()
_MAX_BYTES = 50 * 1024 * 1024


# ─── Helpers ──────────────────────────────────────────────────────────────────

async def _read_pdf(file: UploadFile) -> tuple[bytes, str]:
    filename = file.filename or "upload.pdf"
    ct = (file.content_type or "").lower()
    if not (
        ct in {"application/pdf", "application/x-pdf", "binary/octet-stream"}
        or filename.lower().endswith(".pdf")
    ):
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                            detail=f"Only PDF files are accepted. Got: '{ct}'")
    data = await file.read()
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Empty file.")
    if len(data) > _MAX_BYTES:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail="File exceeds 50 MB limit.")
    if not data.startswith(b"%PDF-"):
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                            detail="Not a valid PDF (missing %PDF- header).")
    return data, filename


def _build_report(raw: dict) -> GreenwashingReport:
    return GreenwashingReport(
        filename=raw["filename"],
        risk_level=raw["risk_level"],
        risk_score=raw["risk_score"],
        risk_color=raw["risk_color"],
        summary=raw["summary"],
        reasons=[GreenwashingReason(**r) for r in raw["reasons"]],
        missing_evidence=[MissingEvidence(**m) for m in raw["missing_evidence"]],
        recommendations=[Recommendation(**r) for r in raw["recommendations"]],
        claim_breakdown=ClaimBreakdown(**raw["claim_breakdown"]),
        flags=ReportFlags(**raw["flags"]),
    )


# ─── Full-pipeline PDF endpoint ───────────────────────────────────────────────

@router.post(
    "/pdf",
    response_model=AnalyzePDFResponse,
    summary="Upload PDF — full greenwashing analysis pipeline",
    description=(
        "Upload a PDF sustainability report. Runs four sequential steps:\n\n"
        "1. **Extract** per-page text\n"
        "2. **Detect** sustainability claims\n"
        "3. **Verify** each claim against the document text\n"
        "4. **Analyze** for greenwashing patterns\n\n"
        "Returns a complete risk report with risk level, score (0–100), reasons, "
        "missing evidence, and prioritised recommendations."
    ),
    responses={
        400: {"model": ErrorResponse}, 413: {"model": ErrorResponse},
        415: {"model": ErrorResponse}, 500: {"model": ErrorResponse},
    },
)
async def analyze_pdf(
    file: UploadFile = File(..., description="PDF sustainability report"),
) -> AnalyzePDFResponse:
    pdf_bytes, filename = await _read_pdf(file)

    try:
        _, page_count = extract_metadata(pdf_bytes)
        pages         = extract_text(pdf_bytes, include_blocks=False)
        page_dicts    = [{"page": p.page, "content": p.content} for p in pages]
        claims        = detect_claims(page_dicts)
        verified      = verify_claims(claims, page_dicts)
        raw           = analyze_greenwashing(verified, filename)
        
        from services.product_extractor import extract_products_from_pdf
        extracted_prods = extract_products_from_pdf(page_dicts, claims)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Greenwashing pipeline failed for '%s'", filename)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Analysis failed: {exc}") from exc

    return AnalyzePDFResponse(
        page_count=page_count,
        report=_build_report(raw),
        verified_claims=verified,
        products=extracted_prods,
    )


# ─── JSON-body endpoint ───────────────────────────────────────────────────────

@router.post(
    "/analyze",
    response_model=AnalyzeClaimsResponse,
    summary="Analyze pre-verified claims for greenwashing",
    description=(
        "Supply pre-verified claim results as JSON. "
        "Returns the same greenwashing report as `/api/greenwashing/pdf`."
    ),
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def analyze_claims(
    body: AnalyzeClaimsRequest = Body(...),
) -> AnalyzeClaimsResponse:
    try:
        results = [r.model_dump() for r in body.results]
        raw     = analyze_greenwashing(results, body.filename)
    except Exception as exc:
        logger.exception("Greenwashing analysis failed")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Analysis failed: {exc}") from exc

    return AnalyzeClaimsResponse(report=_build_report(raw))
