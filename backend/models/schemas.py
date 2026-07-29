"""
EcoLabel X — Pydantic Schemas
All request/response models for the PDF extraction API.
"""

from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field


# ─── Sub-models ───────────────────────────────────────────────────────────────

class BoundingBox(BaseModel):
    """PDF coordinate bounding box (points from bottom-left origin)."""
    x0: float = Field(..., description="Left edge (points)")
    y0: float = Field(..., description="Top edge (points)")
    x1: float = Field(..., description="Right edge (points)")
    y1: float = Field(..., description="Bottom edge (points)")


class TextBlock(BaseModel):
    """A single contiguous block of text on a page."""
    text:       str           = Field(..., description="Block content")
    bbox:       BoundingBox   = Field(..., description="Position on page")
    block_type: str           = Field("text", description="'text' or 'image'")


class PageText(BaseModel):
    """All text extracted from one page."""
    page:       int             = Field(..., ge=1, description="1-indexed page number")
    content:    str             = Field(..., description="Full plain-text content of the page")
    word_count: int             = Field(..., ge=0)
    char_count: int             = Field(..., ge=0)
    blocks:     list[TextBlock] = Field(default_factory=list, description="Individual text blocks with positions")


class TableData(BaseModel):
    """A single table extracted from a page."""
    page:        int            = Field(..., ge=1, description="1-indexed page number")
    table_index: int            = Field(..., ge=0, description="0-indexed table order on the page")
    columns:     list[str]      = Field(..., description="Column header names (inferred or generated)")
    rows:        list[list[Optional[str]]] = Field(..., description="Table rows (may contain None for empty cells)")
    row_count:   int            = Field(..., ge=0)
    col_count:   int            = Field(..., ge=0)
    bbox:        Optional[BoundingBox] = Field(None, description="Table bounding box if available")


class DocumentMetadata(BaseModel):
    """PDF document-level metadata."""
    title:             Optional[str] = None
    author:            Optional[str] = None
    subject:           Optional[str] = None
    keywords:          Optional[str] = None
    creator:           Optional[str] = None
    producer:          Optional[str] = None
    creation_date:     Optional[str] = None
    modification_date: Optional[str] = None
    is_encrypted:      bool          = False
    pdf_version:       Optional[str] = None


class ExtractionSummary(BaseModel):
    """Aggregate statistics for an extraction run."""
    total_words:       int       = Field(..., ge=0)
    total_chars:       int       = Field(..., ge=0)
    total_tables:      int       = Field(..., ge=0)
    total_table_rows:  int       = Field(..., ge=0)
    pages_with_text:   list[int] = Field(default_factory=list)
    pages_with_tables: list[int] = Field(default_factory=list)


# ─── Response models ──────────────────────────────────────────────────────────

class PDFInfoResponse(BaseModel):
    """Response for /api/pdf/info."""
    success:    bool             = True
    filename:   str
    size_bytes: int
    page_count: int
    metadata:   DocumentMetadata


class TextExtractionResponse(BaseModel):
    """Response for /api/pdf/extract/text."""
    success:    bool          = True
    filename:   str
    size_bytes: int
    page_count: int
    text:       list[PageText]
    summary:    ExtractionSummary


class TableExtractionResponse(BaseModel):
    """Response for /api/pdf/extract/tables."""
    success:    bool            = True
    filename:   str
    size_bytes: int
    page_count: int
    tables:     list[TableData]
    summary:    ExtractionSummary


class FullExtractionResponse(BaseModel):
    """Response for /api/pdf/extract/all — text + tables + metadata."""
    success:    bool             = True
    filename:   str
    size_bytes: int
    page_count: int
    metadata:   DocumentMetadata
    text:       list[PageText]
    tables:     list[TableData]
    summary:    ExtractionSummary


# ─── Error model ──────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    """Standardized error envelope returned on all 4xx/5xx responses."""
    success:     bool = False
    error:       str  = Field(..., description="Error type / class name")
    detail:      str  = Field(..., description="Human-readable explanation")
    status_code: int
