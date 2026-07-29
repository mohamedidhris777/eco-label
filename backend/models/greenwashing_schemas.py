"""
EcoLabel X — Pydantic schemas for the Greenwashing Analysis API.
"""

from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, Field

RiskLevel    = Literal["Low", "Medium", "High", "Critical"]
Severity     = Literal["critical", "high", "medium", "low"]
Priority     = Literal["critical", "high", "medium", "low"]


class GreenwashingReason(BaseModel):
    code:            str
    title:           str
    description:     str
    severity:        Severity
    affected_claims: int
    category:        str


class MissingEvidence(BaseModel):
    category: str
    item:     str
    priority: Priority


class Recommendation(BaseModel):
    priority:   Priority
    action:     str
    rationale:  str
    category:   str


class ClaimBreakdown(BaseModel):
    total:                        int
    verified:                     int
    partially_verified:           int
    not_verified:                 int
    vague_claims:                 int
    quantitative_claims:          int
    absolute_claims_unverified:   int


class ReportFlags(BaseModel):
    has_certifications: bool
    has_third_party:    bool
    has_timelines:      bool


class GreenwashingReport(BaseModel):
    filename:         str
    risk_level:       RiskLevel
    risk_score:       int   = Field(..., ge=0, le=100)
    risk_color:       str
    summary:          str
    reasons:          list[GreenwashingReason]
    missing_evidence: list[MissingEvidence]
    recommendations:  list[Recommendation]
    claim_breakdown:  ClaimBreakdown
    flags:            ReportFlags


class AnalyzePDFResponse(BaseModel):
    """Response for POST /api/greenwashing/pdf — full pipeline."""
    success:         bool            = True
    page_count:      int
    report:          GreenwashingReport
    verified_claims: list[dict]      = Field(default_factory=list)
    products:        list[dict]      = Field(default_factory=list)


# ─── JSON-body request ────────────────────────────────────────────────────────

class VerificationResultInput(BaseModel):
    """Minimal verification result for the JSON-body endpoint."""
    claim:                   str
    page:                    int        = Field(default=1, ge=1)
    category:                str        = "general"
    verdict:                 str
    verification_confidence: float      = Field(default=0.5, ge=0.0, le=1.0)
    original_confidence:     float      = Field(default=0.5, ge=0.0, le=1.0)
    evidence:                list[dict] = Field(default_factory=list)


class AnalyzeClaimsRequest(BaseModel):
    """Request body for POST /api/greenwashing/analyze (programmatic)."""
    results:  list[VerificationResultInput] = Field(..., min_length=1)
    filename: str = Field(default="report.pdf")


class AnalyzeClaimsResponse(BaseModel):
    """Response for POST /api/greenwashing/analyze."""
    success: bool = True
    report:  GreenwashingReport
