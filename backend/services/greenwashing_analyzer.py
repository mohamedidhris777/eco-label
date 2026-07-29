"""
EcoLabel X — Greenwashing Analyzer Service
Scores a set of verified claims against a comprehensive greenwashing risk rubric.
No AI, no database — pure rule-based signal detection.

Risk levels:  Low (0-24) | Medium (25-49) | High (50-74) | Critical (75-100)
"""

from __future__ import annotations
import re
import logging
from typing import Optional

logger = logging.getLogger("ecolabelx.greenwashing_analyzer")

# ─── Vague-language patterns (lower confidence = higher greenwashing risk) ────
_VAGUE = re.compile(
    r'\b(?:eco[\s-]friendly|environmentally\s+(?:friendly|responsible)|'
    r'green(?!\s+energy|\s+electricity|\s+house)|natural|clean(?!\s+energy)|'
    r'sustainable(?!\s+sourcing|\s+packaging|\s+supply)|'
    r'responsible(?!\s+sourcing))\b',
    re.IGNORECASE,
)

# Quantitative signal — claim contains actual numbers
_QUANT = re.compile(r'\b\d+(?:\.\d+)?\s*(?:%|tonne[s]?|ton[s]?|kg|MT|MW|GW|MWh|GWh|litre[s]?|m3|hectare[s]?|ha)\b')
_PCT   = re.compile(r'\b\d+(?:\.\d+)?\s*%\b')

# Absolute claim markers ("100%", "zero", "net zero", "carbon neutral") — high risk if unverified
_ABSOLUTE = re.compile(
    r'\b(?:100\s*%|zero\s+(?:waste|carbon|emission[s]?)|'
    r'carbon[\s-]neutral|net[\s-]zero|fully?\s+(?:renewable|sustainable|recycled|certified))\b',
    re.IGNORECASE,
)

# Timeline specificity
_TIMELINE = re.compile(r'\bby\s+20[2-5][0-9]\b', re.IGNORECASE)

# Third-party verification signal
_THIRD_PARTY = re.compile(
    r'\b(?:third[\s-]party|independently?\s+(?:verified|audited|certified)|'
    r'external\s+(?:audit|verification)|assurance\s+statement)\b',
    re.IGNORECASE,
)

# ─── Missing evidence templates by category ───────────────────────────────────
_MISSING_EVIDENCE: dict[str, list[str]] = {
    "carbon": [
        "Scope 1, 2, and 3 emissions data (tCO2e) with baseline year",
        "Third-party assured GHG inventory report",
        "Science-based target validation (SBTi)",
    ],
    "renewable_energy": [
        "Energy generation/consumption figures (MWh or GWh per year)",
        "Renewable Energy Certificates (RECs) or PPA agreements",
        "Year-over-year energy mix comparison",
    ],
    "recycling": [
        "Waste diversion data (tonnes/year) with landfill comparison",
        "Recycled content percentage by material stream",
        "Circular economy KPIs and measurement methodology",
    ],
    "water": [
        "Water withdrawal data (megalitres/year) by source",
        "Water intensity metric (per unit of production)",
        "AWS or equivalent third-party water stewardship certification",
    ],
    "biodiversity": [
        "Land area under protection or restoration (hectares)",
        "Species impact assessment or no-net-loss commitment",
        "RSPO, FSC, or equivalent deforestation-free certification",
    ],
    "supply_chain": [
        "Supplier audit coverage (% of supply base audited)",
        "Modern Slavery and Child Labour audit results",
        "Third-party supply chain traceability report",
    ],
    "packaging": [
        "Packaging weight and material composition breakdown",
        "Recycled content percentage with test certificates",
        "Extended producer responsibility (EPR) compliance data",
    ],
    "certification": [
        "Valid certification numbers, issuing body, and expiry dates",
        "Scope of certification (products, sites, or organisation-wide)",
        "Independent audit schedule and last audit date",
    ],
    "targets": [
        "Baseline year emissions/consumption data for each target",
        "Interim milestones and progress-to-date",
        "Governing body or board accountability for targets",
    ],
}

# ─── Recommendation templates ─────────────────────────────────────────────────
def _build_recommendations(
    risk_score:        int,
    unverified_ratio:  float,
    vague_ratio:       float,
    has_certs:         bool,
    has_third_party:   bool,
    has_timelines:     bool,
    no_quant_ratio:    float,
    absolute_unverif:  int,
) -> list[dict]:
    recs: list[dict] = []

    if unverified_ratio > 0.5:
        recs.append({
            "priority":   "critical",
            "action":     "Commission an independent sustainability audit",
            "rationale":  (
                f"{round(unverified_ratio * 100)}% of claims lack corroborating evidence in the report. "
                "An external audit will validate claims and identify data gaps."
            ),
            "category":   "verification",
        })

    if vague_ratio > 0.3:
        recs.append({
            "priority":   "high",
            "action":     "Replace vague qualitative language with specific, measurable claims",
            "rationale":  (
                f"{round(vague_ratio * 100)}% of claims use non-specific terms such as "
                "'eco-friendly', 'green', or 'natural'. Replace with quantified metrics."
            ),
            "category":   "language",
        })

    if not has_certs:
        recs.append({
            "priority":   "high",
            "action":     "Pursue recognised sustainability certifications",
            "rationale":  (
                "No third-party certifications (ISO 14001, FSC, B Corp, Rainforest Alliance, etc.) "
                "were detected. Certifications provide independent credibility for environmental claims."
            ),
            "category":   "certification",
        })

    if not has_third_party:
        recs.append({
            "priority":   "high",
            "action":     "Obtain third-party assurance for sustainability disclosures",
            "rationale":  (
                "No independently verified or audited data was detected. "
                "Limited assurance or reasonable assurance from a recognised firm strengthens credibility."
            ),
            "category":   "verification",
        })

    if no_quant_ratio > 0.4:
        recs.append({
            "priority":   "high",
            "action":     "Add quantitative data to support sustainability claims",
            "rationale":  (
                f"{round(no_quant_ratio * 100)}% of claims lack measurable data (%, tonnes, MWh, hectares). "
                "Quantified claims are substantially harder to challenge as greenwashing."
            ),
            "category":   "data",
        })

    if not has_timelines:
        recs.append({
            "priority":   "medium",
            "action":     "Attach specific deadlines to all environmental targets",
            "rationale":  (
                "No year-based timelines (e.g., 'by 2030') were detected for target claims. "
                "Open-ended commitments are a recognised greenwashing signal."
            ),
            "category":   "targets",
        })

    if absolute_unverif > 0:
        recs.append({
            "priority":   "critical",
            "action":     f"Substantiate {absolute_unverif} absolute claim(s) with evidence",
            "rationale":  (
                f"{absolute_unverif} absolute claim(s) (e.g., '100% renewable', 'carbon neutral', 'zero waste') "
                "could not be corroborated. Absolute claims face the highest regulatory scrutiny."
            ),
            "category":   "claims",
        })

    if risk_score < 25:
        recs.append({
            "priority":   "low",
            "action":     "Maintain current disclosure standards and review annually",
            "rationale":  (
                "Overall greenwashing risk is low. Continue to improve specificity "
                "and consider voluntary reporting frameworks (GRI, TCFD, CSRD)."
            ),
            "category":   "maintenance",
        })

    # Sort by priority weight
    _pri = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    recs.sort(key=lambda r: _pri.get(r["priority"], 9))
    return recs


# ─── Main analysis function ───────────────────────────────────────────────────

def analyze_greenwashing(
    results:  list[dict],
    filename: str = "unknown.pdf",
) -> dict:
    """
    Analyse a list of ClaimVerificationResult dicts and return a greenwashing risk report.

    Args:
        results:  List of verification result dicts (from evidence_verifier.verify_claims).
        filename: Source PDF filename (for report metadata).

    Returns:
        Full greenwashing analysis dict.
    """
    if not results:
        return _empty_report(filename)

    total = len(results)

    # ── Counts by verdict ─────────────────────────────────────────────────────
    verified_claims   = [r for r in results if r["verdict"] == "verified"]
    partial_claims    = [r for r in results if r["verdict"] == "partially_verified"]
    unverif_claims    = [r for r in results if r["verdict"] == "not_verified"]

    unverified_ratio  = len(unverif_claims) / total
    partial_ratio     = len(partial_claims)  / total

    # ── Vague language ────────────────────────────────────────────────────────
    vague_claims = [r for r in results if _VAGUE.search(r["claim"])]
    vague_ratio  = len(vague_claims) / total

    # ── Quantitative backing ──────────────────────────────────────────────────
    quant_claims   = [r for r in results if _QUANT.search(r["claim"]) or _PCT.search(r["claim"])]
    no_quant_ratio = (total - len(quant_claims)) / total

    # ── Absolute claims (unverified only) ─────────────────────────────────────
    absolute_unverif = sum(
        1 for r in unverif_claims if _ABSOLUTE.search(r["claim"])
    )

    # ── Certifications & third-party ─────────────────────────────────────────
    has_certs = any(r["category"] == "certification" for r in verified_claims + partial_claims)
    has_third_party = any(
        e.get("evidence_type") == "verified_by_third_party"
        for r in results
        for e in r.get("evidence", [])
    )

    # ── Timelines ─────────────────────────────────────────────────────────────
    has_timelines = any(
        _TIMELINE.search(r["claim"])
        for r in results
        if r["category"] == "targets"
    )

    # ── Risk score (0–100) ────────────────────────────────────────────────────
    score_unverif     = unverified_ratio * 40          # max 40
    score_partial     = partial_ratio    * 10          # max 10
    score_vague       = vague_ratio      * 20          # max 20
    score_no_quant    = no_quant_ratio   * 15          # max 15
    score_no_cert     = 5 if not has_certs       else 0
    score_no_3p       = 5 if not has_third_party else 0
    score_absolute    = min(5, absolute_unverif  * 1.5)

    risk_score = round(min(100, (
        score_unverif + score_partial + score_vague +
        score_no_quant + score_no_cert + score_no_3p + score_absolute
    )))

    # ── Risk level ────────────────────────────────────────────────────────────
    if risk_score < 25:
        risk_level = "Low"
        risk_color = "#00ffaa"
    elif risk_score < 50:
        risk_level = "Medium"
        risk_color = "#ffb300"
    elif risk_score < 75:
        risk_level = "High"
        risk_color = "#f97316"
    else:
        risk_level = "Critical"
        risk_color = "#ef4444"

    # ── Reasons ───────────────────────────────────────────────────────────────
    reasons: list[dict] = []

    if len(unverif_claims) > 0:
        pct = round(unverified_ratio * 100)
        reasons.append({
            "code":            "high_unverified_ratio",
            "title":           f"{pct}% of claims are not verified",
            "description":     (
                f"{len(unverif_claims)} out of {total} sustainability claims could not be "
                "corroborated by evidence in the document text. "
                "This is the strongest greenwashing signal."
            ),
            "severity":        "critical" if pct > 60 else "high" if pct > 30 else "medium",
            "affected_claims": len(unverif_claims),
            "category":        "verification",
        })

    if len(partial_claims) > 0:
        reasons.append({
            "code":            "partial_verification",
            "title":           f"{len(partial_claims)} claim(s) only partially supported",
            "description":     (
                f"{len(partial_claims)} claims have related context but lack specific, "
                "quantitative, or third-party-verified corroboration."
            ),
            "severity":        "medium",
            "affected_claims": len(partial_claims),
            "category":        "verification",
        })

    if len(vague_claims) > 0:
        pct = round(vague_ratio * 100)
        reasons.append({
            "code":            "vague_language",
            "title":           f"Vague language in {pct}% of claims",
            "description":     (
                f"{len(vague_claims)} claims use non-specific terms such as 'eco-friendly', "
                "'green', 'natural', or 'sustainable' without quantified supporting data. "
                "Regulators (EU ESPR, FTC Green Guides) classify such language as potentially misleading."
            ),
            "severity":        "high" if pct > 40 else "medium",
            "affected_claims": len(vague_claims),
            "category":        "language",
        })

    if absolute_unverif > 0:
        reasons.append({
            "code":            "unverified_absolute_claims",
            "title":           f"{absolute_unverif} absolute claim(s) without evidence",
            "description":     (
                f"{absolute_unverif} claim(s) make absolute assertions "
                "('100% renewable', 'carbon neutral', 'zero waste') that could not be "
                "corroborated. Absolute claims carry the highest regulatory risk."
            ),
            "severity":        "critical",
            "affected_claims": absolute_unverif,
            "category":        "claims",
        })

    if not has_certs:
        reasons.append({
            "code":            "no_certifications",
            "title":           "No third-party certifications detected",
            "description":     (
                "No recognised environmental certifications (ISO 14001, FSC, B Corp, "
                "Rainforest Alliance, LEED, GOTS, etc.) were found in the document. "
                "Certifications are a key credibility anchor for environmental claims."
            ),
            "severity":        "high",
            "affected_claims": 0,
            "category":        "certification",
        })

    if not has_third_party:
        reasons.append({
            "code":            "no_third_party_verification",
            "title":           "No independent verification found",
            "description":     (
                "No evidence of third-party audits, independent assurance statements, "
                "or external verification was detected. "
                "Self-reported sustainability data without assurance is a known greenwashing risk."
            ),
            "severity":        "high",
            "affected_claims": 0,
            "category":        "verification",
        })

    if not has_timelines and any(r["category"] == "targets" for r in results):
        reasons.append({
            "code":            "no_timelines",
            "title":           "Target claims lack specific deadlines",
            "description":     (
                "Environmental targets were detected but none include a specific year deadline. "
                "Open-ended commitments ('we aim to reduce…') are a recognised greenwashing pattern."
            ),
            "severity":        "medium",
            "affected_claims": sum(1 for r in results if r["category"] == "targets"),
            "category":        "targets",
        })

    if no_quant_ratio > 0.5:
        pct = round(no_quant_ratio * 100)
        reasons.append({
            "code":            "insufficient_quantitative_data",
            "title":           f"{pct}% of claims lack quantitative data",
            "description":     (
                f"{round(no_quant_ratio * total)} claims contain no measurable metrics "
                "(percentages, tonnes, MWh, litres, hectares). "
                "Qualitative-only claims are difficult to verify and commonly associated with greenwashing."
            ),
            "severity":        "medium",
            "affected_claims": round(no_quant_ratio * total),
            "category":        "data",
        })

    # Sort by severity weight
    _sev = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    reasons.sort(key=lambda r: _sev.get(r["severity"], 9))

    # ── Missing evidence ──────────────────────────────────────────────────────
    missing: list[dict] = []
    seen_cats: set[str] = set()

    # Prioritise categories with unverified claims
    for r in unverif_claims:
        cat = r["category"]
        if cat not in seen_cats and cat in _MISSING_EVIDENCE:
            seen_cats.add(cat)
            for item in _MISSING_EVIDENCE[cat]:
                missing.append({
                    "category": cat,
                    "item":     item,
                    "priority": "high",
                })

    # Then partially verified
    for r in partial_claims:
        cat = r["category"]
        if cat not in seen_cats and cat in _MISSING_EVIDENCE:
            seen_cats.add(cat)
            for item in _MISSING_EVIDENCE[cat]:
                missing.append({
                    "category": cat,
                    "item":     item,
                    "priority": "medium",
                })

    # Universal gaps
    if not has_third_party:
        missing.append({
            "category": "general",
            "item":     "Independent third-party assurance statement (limited or reasonable assurance)",
            "priority": "high",
        })
    if not has_certs:
        missing.append({
            "category": "general",
            "item":     "Recognised environmental certification(s) with certificate numbers and validity dates",
            "priority": "high",
        })

    # ── Recommendations ───────────────────────────────────────────────────────
    recommendations = _build_recommendations(
        risk_score, unverified_ratio, vague_ratio,
        has_certs, has_third_party, has_timelines,
        no_quant_ratio, absolute_unverif,
    )

    # ── Executive summary ─────────────────────────────────────────────────────
    summary = (
        f"Analysis of {total} sustainability claims from '{filename}' indicates "
        f"**{risk_level.upper()} greenwashing risk** (score: {risk_score}/100). "
        f"{len(verified_claims)} claim(s) are well-supported, "
        f"{len(partial_claims)} partially supported, and "
        f"{len(unverif_claims)} could not be corroborated. "
        + (f"No third-party certifications or independent verification was detected. " if not has_certs else "")
        + (f"{len(vague_claims)} claim(s) use vague language. " if vague_claims else "")
        + ("Immediate remediation is recommended." if risk_score >= 50 else
           "Moderate improvements are recommended." if risk_score >= 25 else
           "Disclosure standards are generally acceptable.")
    )

    # ── Claim breakdown ───────────────────────────────────────────────────────
    by_category: dict[str, dict] = {}
    for r in results:
        cat = r["category"]
        if cat not in by_category:
            by_category[cat] = {"total": 0, "verified": 0, "partially_verified": 0, "not_verified": 0}
        by_category[cat]["total"] += 1
        by_category[cat][r["verdict"]] += 1

    logger.info(
        "Greenwashing analysis complete: risk_level=%s score=%d reasons=%d",
        risk_level, risk_score, len(reasons),
    )

    return {
        "filename":       filename,
        "risk_level":     risk_level,
        "risk_score":     risk_score,
        "risk_color":     risk_color,
        "summary":        summary,
        "reasons":        reasons,
        "missing_evidence": missing,
        "recommendations": recommendations,
        "claim_breakdown": {
            "total":              total,
            "verified":           len(verified_claims),
            "partially_verified": len(partial_claims),
            "not_verified":       len(unverif_claims),
            "vague_claims":       len(vague_claims),
            "quantitative_claims": len(quant_claims),
            "absolute_claims_unverified": absolute_unverif,
        },
        "flags": {
            "has_certifications":     has_certs,
            "has_third_party":        has_third_party,
            "has_timelines":          has_timelines,
        },
    }


def _empty_report(filename: str) -> dict:
    return {
        "filename":         filename,
        "risk_level":       "Low",
        "risk_score":       0,
        "risk_color":       "#00ffaa",
        "summary":          "No claims were detected in this document.",
        "reasons":          [],
        "missing_evidence": [],
        "recommendations":  [],
        "claim_breakdown":  {
            "total": 0, "verified": 0, "partially_verified": 0,
            "not_verified": 0, "vague_claims": 0, "quantitative_claims": 0,
            "absolute_claims_unverified": 0,
        },
        "flags": {
            "has_certifications": False,
            "has_third_party":    False,
            "has_timelines":      False,
        },
    }
