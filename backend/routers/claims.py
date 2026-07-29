"""
EcoLabel X — Claims Router
POST /api/claims/detect  — upload PDF, detect sustainability claims, return JSON.
"""

from __future__ import annotations
import logging

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from models.claim_schemas import ClaimDetectionResponse, ClaimResult, ClaimsSummary
from models.schemas       import ErrorResponse
from services.text_extractor import extract_text, extract_metadata
from services.claim_detector import detect_claims, build_claims_summary

logger = logging.getLogger("ecolabelx.router.claims")

router = APIRouter()

_MAX_BYTES = 50 * 1024 * 1024  # 50 MB


async def _read_pdf(file: UploadFile) -> tuple[bytes, str]:
    filename = file.filename or "upload.pdf"
    ct = (file.content_type or "").lower()
    if not (
        ct in {"application/pdf", "application/x-pdf", "binary/octet-stream"}
        or filename.lower().endswith(".pdf")
    ):
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Only PDF files are accepted. Got: '{ct}'",
        )
    data = await file.read()
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Empty file.")
    if len(data) > _MAX_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File exceeds the 50 MB limit.",
        )
    if not data.startswith(b"%PDF-"):
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Not a valid PDF (missing %PDF- header).",
        )
    return data, filename


@router.post(
    "/detect",
    response_model=ClaimDetectionResponse,
    summary="Detect sustainability claims in a PDF",
    description=(
        "Upload a PDF sustainability report. The service extracts per-page text "
        "then scans every sentence against 9 sustainability categories using "
        "compiled regex patterns. Returns: claim text, page number, confidence "
        "score (0–1), category, and matched keywords."
    ),
    responses={
        400: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        415: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def detect_claims_endpoint(
    file: UploadFile = File(..., description="PDF sustainability report to analyse"),
) -> ClaimDetectionResponse:
    pdf_bytes, filename = await _read_pdf(file)

    try:
        raw_meta, page_count = extract_metadata(pdf_bytes)

        if raw_meta.get("is_encrypted"):
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                detail="PDF is encrypted. Decrypt before uploading.",
            )

        pages      = extract_text(pdf_bytes, include_blocks=False)
        page_dicts = [{"page": p.page, "content": p.content} for p in pages]
        raw_claims = detect_claims(page_dicts)
        raw_summary = build_claims_summary(raw_claims)

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Claim detection failed for '%s'", filename)
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Claim detection failed: {exc}",
        ) from exc

    return ClaimDetectionResponse(
        filename=filename,
        size_bytes=len(pdf_bytes),
        page_count=page_count,
        claims=[ClaimResult(**c) for c in raw_claims],
        summary=ClaimsSummary(**raw_summary),
    )
