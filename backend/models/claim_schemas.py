"""
EcoLabel X — Pydantic schemas for the Claims API.
Added to the existing schemas module — only new models defined here.
"""

from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field


class ClaimResult(BaseModel):
    """A single detected sustainability claim."""
    claim:            str       = Field(..., description="The full sentence containing the claim")
    page:             int       = Field(..., ge=1, description="1-indexed page number")
    confidence:       float     = Field(..., ge=0.0, le=1.0, description="Confidence score 0–1")
    category:         str       = Field(..., description="Claim category")
    keywords_matched: list[str] = Field(default_factory=list, description="Keywords that triggered this detection")


class ClaimsSummary(BaseModel):
    """Aggregate statistics for a claim detection run."""
    total_claims:          int            = Field(..., ge=0)
    by_category:           dict[str, int] = Field(default_factory=dict)
    avg_confidence:        float          = Field(..., ge=0.0, le=1.0)
    high_confidence_count: int            = Field(..., ge=0, description="Claims with confidence ≥ 0.75")
    pages_with_claims:     list[int]      = Field(default_factory=list)


class ClaimDetectionResponse(BaseModel):
    """Response for POST /api/claims/detect."""
    success:    bool          = True
    filename:   str
    size_bytes: int
    page_count: int
    claims:     list[ClaimResult]
    summary:    ClaimsSummary
