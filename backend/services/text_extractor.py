"""
EcoLabel X — Text Extraction Service
Uses PyMuPDF (fitz) to extract per-page text and block-level positions from PDF files.
"""

from __future__ import annotations
import logging
from typing import TYPE_CHECKING

import fitz  # PyMuPDF

from models.schemas import PageText, TextBlock, BoundingBox, ExtractionSummary

if TYPE_CHECKING:
    pass

logger = logging.getLogger("ecolabelx.text_extractor")


def _bbox_to_model(bbox: tuple[float, float, float, float]) -> BoundingBox:
    return BoundingBox(x0=bbox[0], y0=bbox[1], x1=bbox[2], y1=bbox[3])


def _parse_date(raw: str | None) -> str | None:
    """
    Convert PDF date strings like "D:20260401090000+05'30'" to ISO-8601.
    Returns the raw string if parsing fails.
    """
    if not raw:
        return None
    # Strip leading "D:" prefix
    s = raw.strip()
    if s.startswith("D:"):
        s = s[2:]
    # Take the first 14 digits: YYYYMMDDHHmmss
    if len(s) >= 14:
        try:
            y, mo, d  = s[0:4], s[4:6], s[6:8]
            h, mi, sc = s[8:10], s[10:12], s[12:14]
            return f"{y}-{mo}-{d}T{h}:{mi}:{sc}"
        except Exception:
            pass
    return raw


def extract_text(pdf_bytes: bytes, *, include_blocks: bool = True) -> list[PageText]:
    """
    Extract text from all pages of a PDF.

    Args:
        pdf_bytes:      Raw bytes of the PDF file.
        include_blocks: When True, individual text block positions are included.

    Returns:
        A list of PageText objects, one per page.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages: list[PageText] = []

    for page_index in range(len(doc)):
        page = doc[page_index]

        # Full plain text (preserves layout spacing)
        full_text: str = page.get_text("text")  # type: ignore[attr-defined]

        word_count = len(full_text.split()) if full_text.strip() else 0
        char_count = len(full_text)

        blocks: list[TextBlock] = []
        if include_blocks:
            raw_blocks = page.get_text("blocks")  # type: ignore[attr-defined]
            # Each block: (x0, y0, x1, y1, text, block_no, block_type)
            # block_type: 0=text, 1=image
            for block in raw_blocks:
                if len(block) < 7:
                    continue
                x0, y0, x1, y1, block_text, _block_no, block_type = block
                if not str(block_text).strip():
                    continue
                blocks.append(
                    TextBlock(
                        text=str(block_text).strip(),
                        bbox=BoundingBox(x0=x0, y0=y0, x1=x1, y1=y1),
                        block_type="image" if int(block_type) == 1 else "text",
                    )
                )

        pages.append(
            PageText(
                page=page_index + 1,
                content=full_text,
                word_count=word_count,
                char_count=char_count,
                blocks=blocks,
            )
        )

    doc.close()
    logger.info("Extracted text from %d pages", len(pages))
    return pages


def extract_metadata(pdf_bytes: bytes) -> dict:
    """
    Extract document-level metadata from a PDF using PyMuPDF.

    Returns a dict matching DocumentMetadata fields.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    meta = doc.metadata or {}

    result = {
        "title":             meta.get("title")    or None,
        "author":            meta.get("author")   or None,
        "subject":           meta.get("subject")  or None,
        "keywords":          meta.get("keywords") or None,
        "creator":           meta.get("creator")  or None,
        "producer":          meta.get("producer") or None,
        "creation_date":     _parse_date(meta.get("creationDate")),
        "modification_date": _parse_date(meta.get("modDate")),
        "is_encrypted":      doc.is_encrypted,
        "pdf_version":       f"1.{doc.pdf_version()}" if hasattr(doc, "pdf_version") else None,
    }

    page_count = len(doc)
    doc.close()

    return result, page_count


def build_text_summary(pages: list[PageText], table_data: list | None = None) -> ExtractionSummary:
    """Compute aggregate statistics across all extracted pages."""
    total_words = sum(p.word_count for p in pages)
    total_chars = sum(p.char_count for p in pages)
    pages_with_text = [p.page for p in pages if p.word_count > 0]

    pages_with_tables: list[int] = []
    total_tables      = 0
    total_table_rows  = 0

    if table_data:
        seen_pages: set[int] = set()
        for t in table_data:
            total_tables += 1
            total_table_rows += t.row_count
            seen_pages.add(t.page)
        pages_with_tables = sorted(seen_pages)

    return ExtractionSummary(
        total_words=total_words,
        total_chars=total_chars,
        total_tables=total_tables,
        total_table_rows=total_table_rows,
        pages_with_text=pages_with_text,
        pages_with_tables=pages_with_tables,
    )
