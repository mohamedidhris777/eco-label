"""
EcoLabel X — PDF Router
All /api/pdf/* endpoints for upload, info, text extraction, and table extraction.
"""

from __future__ import annotations
import logging

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from models.schemas import (
    DocumentMetadata,
    ErrorResponse,
    FullExtractionResponse,
    PDFInfoResponse,
    TableExtractionResponse,
    TextExtractionResponse,
)
from services.text_extractor  import extract_text, extract_metadata, build_text_summary
from services.table_extractor import extract_tables

logger = logging.getLogger("ecolabelx.router.pdf")

router = APIRouter()

# ─── Constants ────────────────────────────────────────────────────────────────

MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024   # 50 MB
PDF_CONTENT_TYPES   = {"application/pdf", "application/x-pdf", "binary/octet-stream"}


# ─── Shared validation helper ─────────────────────────────────────────────────

async def _validate_and_read(file: UploadFile) -> tuple[bytes, str]:
    """
    Read and validate an uploaded PDF file.

    Returns:
        (pdf_bytes, filename)

    Raises:
        HTTPException 415 — not a PDF
        HTTPException 413 — exceeds size limit
        HTTPException 400 — encrypted / zero-byte
    """
    filename = file.filename or "upload.pdf"

    # ── MIME type check ──────────────────────────────────────────────────
    content_type = (file.content_type or "").lower()
    if not (
        content_type in PDF_CONTENT_TYPES
        or filename.lower().endswith(".pdf")
    ):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Only PDF files are accepted. Received content-type: '{content_type}'",
        )

    # ── Read bytes ───────────────────────────────────────────────────────
    pdf_bytes = await file.read()

    # ── Size checks ──────────────────────────────────────────────────────
    if len(pdf_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )
    if len(pdf_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the 50 MB limit ({len(pdf_bytes) / 1_048_576:.1f} MB uploaded).",
        )

    # ── PDF magic bytes (%PDF-) ──────────────────────────────────────────
    if not pdf_bytes.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="File does not appear to be a valid PDF (missing %PDF- header).",
        )

    return pdf_bytes, filename


def _build_error_response(exc: Exception, status_code: int) -> JSONResponse:
    body = ErrorResponse(
        error=type(exc).__name__,
        detail=str(exc),
        status_code=status_code,
    )
    return JSONResponse(status_code=status_code, content=body.model_dump())


# ─── Endpoint: GET info ───────────────────────────────────────────────────────

@router.post(
    "/info",
    response_model=PDFInfoResponse,
    summary="Get PDF info",
    description="Upload a PDF and receive document metadata and page count. No text or tables extracted.",
    responses={
        400: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        415: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def get_pdf_info(
    file: UploadFile = File(..., description="PDF file to inspect"),
) -> PDFInfoResponse:
    pdf_bytes, filename = await _validate_and_read(file)

    try:
        raw_meta, page_count = extract_metadata(pdf_bytes)
    except Exception as exc:
        logger.exception("Metadata extraction failed for '%s'", filename)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read PDF metadata: {exc}",
        ) from exc

    if raw_meta.get("is_encrypted"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PDF is encrypted/password-protected. Decrypt the file before uploading.",
        )

    return PDFInfoResponse(
        filename=filename,
        size_bytes=len(pdf_bytes),
        page_count=page_count,
        metadata=DocumentMetadata(**raw_meta),
    )


# ─── Endpoint: Extract text ───────────────────────────────────────────────────

@router.post(
    "/extract/text",
    response_model=TextExtractionResponse,
    summary="Extract text from PDF",
    description=(
        "Upload a PDF and receive structured per-page text with word counts, "
        "character counts, and bounding-box positions for each text block."
    ),
    responses={
        400: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        415: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def extract_text_endpoint(
    file: UploadFile = File(..., description="PDF file to extract text from"),
    include_blocks: bool = True,
) -> TextExtractionResponse:
    pdf_bytes, filename = await _validate_and_read(file)

    try:
        raw_meta, page_count = extract_metadata(pdf_bytes)

        if raw_meta.get("is_encrypted"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PDF is encrypted/password-protected.",
            )

        pages = extract_text(pdf_bytes, include_blocks=include_blocks)

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Text extraction failed for '%s'", filename)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text extraction failed: {exc}",
        ) from exc

    summary = build_text_summary(pages)

    return TextExtractionResponse(
        filename=filename,
        size_bytes=len(pdf_bytes),
        page_count=page_count,
        text=pages,
        summary=summary,
    )


# ─── Endpoint: Extract tables ─────────────────────────────────────────────────

@router.post(
    "/extract/tables",
    response_model=TableExtractionResponse,
    summary="Extract tables from PDF",
    description=(
        "Upload a PDF and receive all detected tables as structured JSON. "
        "Each table includes inferred column headers, rows, and bounding-box coordinates."
    ),
    responses={
        400: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        415: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def extract_tables_endpoint(
    file: UploadFile = File(..., description="PDF file to extract tables from"),
) -> TableExtractionResponse:
    pdf_bytes, filename = await _validate_and_read(file)

    try:
        raw_meta, page_count = extract_metadata(pdf_bytes)

        if raw_meta.get("is_encrypted"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PDF is encrypted/password-protected.",
            )

        tables = extract_tables(pdf_bytes)

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Table extraction failed for '%s'", filename)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Table extraction failed: {exc}",
        ) from exc

    summary = build_text_summary([], tables)

    return TableExtractionResponse(
        filename=filename,
        size_bytes=len(pdf_bytes),
        page_count=page_count,
        tables=tables,
        summary=summary,
    )


# ─── Endpoint: Extract all ────────────────────────────────────────────────────

@router.post(
    "/extract/all",
    response_model=FullExtractionResponse,
    summary="Extract text + tables + metadata",
    description=(
        "The primary extraction endpoint. Upload a PDF and receive "
        "metadata, full per-page text, all tables, and aggregate summary statistics "
        "in a single JSON response."
    ),
    responses={
        400: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        415: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def extract_all_endpoint(
    file: UploadFile = File(..., description="PDF file to fully extract"),
    include_blocks: bool = True,
) -> FullExtractionResponse:
    pdf_bytes, filename = await _validate_and_read(file)

    try:
        raw_meta, page_count = extract_metadata(pdf_bytes)

        if raw_meta.get("is_encrypted"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PDF is encrypted/password-protected.",
            )

        pages  = extract_text(pdf_bytes,   include_blocks=include_blocks)
        tables = extract_tables(pdf_bytes)

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Full extraction failed for '%s'", filename)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Extraction failed: {exc}",
        ) from exc

    summary = build_text_summary(pages, tables)

    return FullExtractionResponse(
        filename=filename,
        size_bytes=len(pdf_bytes),
        page_count=page_count,
        metadata=DocumentMetadata(**raw_meta),
        text=pages,
        tables=tables,
        summary=summary,
    )
