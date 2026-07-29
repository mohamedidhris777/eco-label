"""
EcoLabel X — Table Extraction Service
Uses pdfplumber to detect and extract tables from PDF pages.
Returns structured TableData objects with inferred column names.
"""

from __future__ import annotations
import io
import logging
from typing import Optional

import pdfplumber

from models.schemas import TableData, BoundingBox

logger = logging.getLogger("ecolabelx.table_extractor")


# ─── Column inference ─────────────────────────────────────────────────────────

def _infer_columns(raw_table: list[list[Optional[str]]], col_count: int) -> tuple[list[str], list[list[Optional[str]]]]:
    """
    Attempt to identify whether the first row is a header row.

    Heuristic:
        - If the first row has no None cells AND all values are non-numeric
          strings (e.g. no row starts with a digit/currency), treat it as headers.
        - Otherwise generate Column1, Column2, … as fallback.

    Returns:
        columns: list of column header strings
        rows:    remaining data rows (first row removed if used as header)
    """
    if not raw_table:
        return [f"Column{i+1}" for i in range(col_count)], []

    candidate_header = raw_table[0]

    # A valid header: all cells are non-None and non-numeric strings
    is_header = (
        all(cell is not None for cell in candidate_header)
        and all(
            not str(cell).strip().replace(".", "").replace(",", "").lstrip("-").isdigit()
            for cell in candidate_header
            if cell
        )
        and len(candidate_header) == col_count
    )

    if is_header:
        columns = [str(c).strip() if c else f"Column{i+1}" for i, c in enumerate(candidate_header)]
        rows    = raw_table[1:]
    else:
        columns = [f"Column{i+1}" for i in range(col_count)]
        rows    = raw_table

    return columns, rows


def _clean_cell(cell: Optional[str]) -> Optional[str]:
    """Strip whitespace from a cell value; return None for empty strings."""
    if cell is None:
        return None
    stripped = str(cell).strip()
    return stripped if stripped else None


def _table_bbox(plumber_table) -> Optional[BoundingBox]:
    """Extract bounding box from a pdfplumber Table object."""
    try:
        bb = plumber_table.bbox
        return BoundingBox(x0=bb[0], y0=bb[1], x1=bb[2], y1=bb[3])
    except Exception:
        return None


# ─── Main extraction function ─────────────────────────────────────────────────

def extract_tables(pdf_bytes: bytes) -> list[TableData]:
    """
    Extract all tables from a PDF file.

    Args:
        pdf_bytes: Raw bytes of the PDF file.

    Returns:
        List of TableData objects, one per detected table across all pages.
        Tables are ordered by page number, then by position on the page.
    """
    tables: list[TableData] = []

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page_index, page in enumerate(pdf.pages):
            page_num = page_index + 1

            try:
                # pdfplumber returns a list of Table objects
                page_tables = page.find_tables()
            except Exception as exc:
                logger.warning("Page %d: could not search for tables — %s", page_num, exc)
                continue

            for table_index, plumber_table in enumerate(page_tables):
                try:
                    raw: list[list[Optional[str]]] = plumber_table.extract()
                except Exception as exc:
                    logger.warning("Page %d, table %d: extraction failed — %s", page_num, table_index, exc)
                    continue

                if not raw:
                    continue

                # Normalise: ensure all rows have the same column count
                col_count = max(len(row) for row in raw) if raw else 0
                if col_count == 0:
                    continue

                normalised = [
                    row + [None] * (col_count - len(row))
                    for row in raw
                ]

                columns, data_rows = _infer_columns(normalised, col_count)

                # Clean cell values
                cleaned_rows: list[list[Optional[str]]] = [
                    [_clean_cell(cell) for cell in row]
                    for row in data_rows
                    if any(cell is not None and str(cell).strip() for cell in row)  # skip blank rows
                ]

                tables.append(
                    TableData(
                        page=page_num,
                        table_index=table_index,
                        columns=columns,
                        rows=cleaned_rows,
                        row_count=len(cleaned_rows),
                        col_count=col_count,
                        bbox=_table_bbox(plumber_table),
                    )
                )

                logger.debug(
                    "Page %d, table %d: %d columns × %d rows",
                    page_num, table_index, col_count, len(cleaned_rows),
                )

    logger.info("Extracted %d tables total", len(tables))
    return tables
