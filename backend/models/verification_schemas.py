"""
EcoLabel X — Pydantic schemas for the Evidence Verification API.
"""

from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel, Field

VerdictType = Literal["verified", "partially_verified", "not_verified"]
EvidenceType = Literal["quantitative", "certification", "target",
                       "verified_by_third_party", "policy", "contextual"]


class EvidencePassage(BaseModel):
    """A single corroborating text passage found in the document."""
    text:            str          = Field(..., description="Supporting sentence from the document")
    page:            int          = Field(..., ge=1)
    relevance_score: float        = Field(..., ge=0.0, le=1.0)
    evidence_type:   EvidenceType = Field(..., description="Type of supporting evidence")


class ClaimVerificationResult(BaseModel):
    """Verification result for a single detected claim."""
    claim:                   str             = Field(..., description="The claim text")
    page:                    int             = Field(..., ge=1)
    category:                str
    keywords_matched:        list[str]       = Field(default_factory=list)
    original_confidence:     float           = Field(..., ge=0.0, le=1.0)
    verdict:                 VerdictType
    verification_confidence: float           = Field(..., ge=0.0, le=1.0)
    evidence:                list[EvidencePassage] = Field(default_factory=list)
    evidence_count:          int             = Field(..., ge=0)
    verdict_reason:          str


class CategoryVerificationBreakdown(BaseModel):
    verified:           int = 0
    partially_verified: int = 0
    not_verified:       int = 0


class VerificationSummary(BaseModel):
    total_claims:                  int
    verified:                      int
    partially_verified:            int
    not_verified:                  int
    avg_verification_confidence:   float
    by_category:                   dict[str, CategoryVerificationBreakdown] = Field(default_factory=dict)


class VerifyPDFResponse(BaseModel):
    """Response for POST /api/verify/pdf — full pipeline result."""
    success:    bool  = True
    filename:   str
    size_bytes: int
    page_count: int
    results:    list[ClaimVerificationResult]
    summary:    VerificationSummary


# ─── JSON-body request for /api/verify/claims ─────────────────────────────────

class ClaimInput(BaseModel):
    """A single claim as input to the JSON-body endpoint."""
    claim:            str       = Field(..., min_length=5)
    page:             int       = Field(..., ge=1)
    category:         str
    confidence:       float     = Field(default=0.5, ge=0.0, le=1.0)
    keywords_matched: list[str] = Field(default_factory=list)


class PageInput(BaseModel):
    """A single page of extracted text."""
    page:    int = Field(..., ge=1)
    content: str


class VerifyClaimsRequest(BaseModel):
    """Request body for POST /api/verify/claims."""
    claims: list[ClaimInput]  = Field(..., min_length=1)
    pages:  list[PageInput]   = Field(..., min_length=1)


class VerifyClaimsResponse(BaseModel):
    """Response for POST /api/verify/claims."""
    success: bool = True
    results: list[ClaimVerificationResult]
    summary: VerificationSummary
