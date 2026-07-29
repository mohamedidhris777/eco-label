"""
EcoLabel X — Verification Router
POST /api/verify/pdf    — upload PDF; runs text extraction → claim detection → verification
POST /api/verify/claims — JSON body with pre-detected claims + pages
"""

from __future__ import annotations
import logging

from fastapi import APIRouter, Body, File, HTTPException, UploadFile, status

from models.verification_schemas import (
    ClaimInput, ClaimVerificationResult, EvidencePassage,
    VerificationSummary, VerifyClaimsRequest, VerifyClaimsResponse,
    VerifyPDFResponse,
)
from models.schemas       import ErrorResponse
from services.text_extractor  import extract_text, extract_metadata
from services.claim_detector  import detect_claims
from services.evidence_verifier import verify_claims, build_verification_summary

logger = logging.getLogger("ecolabelx.router.verification")

router    = APIRouter()
_MAX_BYTES = 50 * 1024 * 1024


# ─── Shared helpers ───────────────────────────────────────────────────────────

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
                            detail="File exceeds the 50 MB limit.")
    if not data.startswith(b"%PDF-"):
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                            detail="Not a valid PDF (missing %PDF- header).")
    return data, filename


def _to_response_results(raw: list[dict]) -> list[ClaimVerificationResult]:
    out = []
    for r in raw:
        out.append(ClaimVerificationResult(
            claim=r["claim"],
            page=r["page"],
            category=r["category"],
            keywords_matched=r.get("keywords_matched", []),
            original_confidence=r["original_confidence"],
            verdict=r["verdict"],
            verification_confidence=r["verification_confidence"],
            evidence=[EvidencePassage(**e) for e in r.get("evidence", [])],
            evidence_count=r["evidence_count"],
            verdict_reason=r["verdict_reason"],
        ))
    return out


def _to_summary(raw: dict) -> VerificationSummary:
    return VerificationSummary(
        total_claims=raw["total_claims"],
        verified=raw["verified"],
        partially_verified=raw["partially_verified"],
        not_verified=raw["not_verified"],
        avg_verification_confidence=raw["avg_verification_confidence"],
        by_category=raw.get("by_category", {}),
    )


# ─── Full-pipeline PDF endpoint ───────────────────────────────────────────────

@router.post(
    "/pdf",
    response_model=VerifyPDFResponse,
    summary="Upload PDF — full verification pipeline",
    description=(
        "Upload a PDF sustainability report. The service runs three sequential steps:\n\n"
        "1. **Extract** per-page text using PyMuPDF\n"
        "2. **Detect** sustainability claims using regex pattern matching\n"
        "3. **Verify** each claim by cross-referencing the full document text\n\n"
        "Returns every claim annotated with a verdict (`verified`, `partially_verified`, "
        "`not_verified`), up to 4 supporting evidence passages, and a confidence score."
    ),
    responses={400: {"model": ErrorResponse}, 413: {"model": ErrorResponse},
               415: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def verify_pdf(
    file: UploadFile = File(..., description="PDF sustainability report"),
) -> VerifyPDFResponse:
    pdf_bytes, filename = await _read_pdf(file)

    try:
        raw_meta, page_count = extract_metadata(pdf_bytes)
        if raw_meta.get("is_encrypted"):
            raise HTTPException(status.HTTP_400_BAD_REQUEST,
                                detail="PDF is encrypted. Decrypt before uploading.")

        pages      = extract_text(pdf_bytes, include_blocks=False)
        page_dicts = [{"page": p.page, "content": p.content} for p in pages]
        claims     = detect_claims(page_dicts)
        raw        = verify_claims(claims, page_dicts)
        raw_sum    = build_verification_summary(raw)

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Verification pipeline failed for '%s'", filename)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Verification failed: {exc}") from exc

    return VerifyPDFResponse(
        filename=filename,
        size_bytes=len(pdf_bytes),
        page_count=page_count,
        results=_to_response_results(raw),
        summary=_to_summary(raw_sum),
    )


# ─── JSON-body endpoint (programmatic) ───────────────────────────────────────

@router.post(
    "/claims",
    response_model=VerifyClaimsResponse,
    summary="Verify pre-detected claims against provided page text",
    description=(
        "Supply pre-detected claims and extracted page text as JSON. "
        "Returns the same verification payload as `/api/verify/pdf` without "
        "re-uploading the source PDF."
    ),
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def verify_claims_endpoint(
    body: VerifyClaimsRequest = Body(...),
) -> VerifyClaimsResponse:
    try:
        claims = [c.model_dump() for c in body.claims]
        pages  = [p.model_dump() for p in body.pages]
        raw    = verify_claims(claims, pages)
        raw_sum = build_verification_summary(raw)
    except Exception as exc:
        logger.exception("Claim verification failed")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Verification failed: {exc}") from exc

    return VerifyClaimsResponse(
        results=_to_response_results(raw),
        summary=_to_summary(raw_sum),
    )
