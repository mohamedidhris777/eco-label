"""
EcoLabel X — Evidence Verification Service
Cross-references each detected claim against the full document text to find
corroborating passages. No AI, no database — pure text analytics.

Verdict scale:
  verified           — strong corroborating evidence found (conf ≥ 0.65)
  partially_verified — some evidence present but incomplete (conf 0.40–0.64)
  not_verified       — no meaningful corroborating evidence (conf < 0.40)
"""

from __future__ import annotations
import re
import logging
from typing import Optional
from services.gemini_verifier import verify_claim_with_gemini, is_gemini_available

logger = logging.getLogger("ecolabelx.evidence_verifier")

# ─── Stop words ───────────────────────────────────────────────────────────────

_STOP = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "shall", "can", "this", "that",
    "these", "those", "it", "its", "we", "our", "they", "their", "you",
    "your", "all", "as", "if", "not", "no", "nor", "so", "yet", "both",
    "either", "than", "such", "more", "most", "other", "into", "through",
    "during", "including", "until", "while", "per", "about", "also",
    "which", "who", "when", "where", "what", "how", "each", "only",
    "same", "then", "than", "some", "very", "just", "been", "well",
}

# ─── Category-level corroboration patterns ────────────────────────────────────
# Used to boost evidence score when the supporting sentence contains
# category-relevant quantitative or procedural language.

_CAT_CORROBORATION: dict[str, list[str]] = {
    "carbon": [
        r"\b(?:scope\s+[123]|GHG|greenhouse\s+gas|CO2|tCO2e|MT CO2)\b",
        r"\b\d+(?:\.\d+)?\s*(?:tonne[s]?|ton[s]?|kg|MT)\s*(?:CO2|GHG|carbon)\b",
        r"\bScience\s+Based\s+Target[s]?\b",
        r"\bSBTi\b",
    ],
    "renewable_energy": [
        r"\b\d+\s*(?:MW|GW|MWh|GWh|kWh)\b",
        r"\b\d+\s*%\s*(?:renewable|clean|green)\b",
        r"\bPPA\b",
        r"\bREC[s]?\b",
    ],
    "recycling": [
        r"\b\d+\s*%\s*(?:recycled|recyclable|post[\s-]consumer)\b",
        r"\b\d+(?:\.\d+)?\s*(?:tonne[s]?|ton[s]?|kg)\s*(?:waste|material)\b",
        r"\bzero[\s-]waste\b",
    ],
    "water": [
        r"\b\d+(?:\.\d+)?\s*(?:litre[s]?|liter[s]?|m3|megalitres?|ML)\b",
        r"\b\d+\s*%\s*(?:water|reduction)\b",
        r"\bwater\s+intensity\b",
    ],
    "biodiversity": [
        r"\b\d+(?:\.\d+)?\s*(?:hectare[s]?|ha|acre[s]?)\b",
        r"\bdeforestation[\s-]free\b",
        r"\bno\s+net\s+loss\b",
    ],
    "supply_chain": [
        r"\b\d+\s*%\s*(?:supplier[s]?|sourced|audited)\b",
        r"\bsupplier\s+audit[s]?\b",
        r"\bcode\s+of\s+conduct\b",
    ],
    "packaging": [
        r"\b\d+\s*%\s*(?:recycled|recyclable|compostable|plastic[\s-]free)\b",
        r"\b\d+(?:\.\d+)?\s*(?:gram[s]?|g|kg)\s+(?:packaging|plastic)\b",
    ],
    "certification": [
        r"\bISO\s*\d{4,5}\b",
        r"\bFSC\b",
        r"\bRainforest\s+Alliance\b",
        r"\bB\s+Corp\b",
        r"\bLEED\b",
        r"\bBREEAM\b",
        r"\bGOTS\b",
    ],
    "targets": [
        r"\b\d+\s*%\s*(?:reduction|reduc\w+|decrease|decarboni\w+)\b",
        r"\bby\s+20[2-5][0-9]\b",
        r"\bbaseline\s+year\b",
        r"\babsolute\s+(?:target|reduction)\b",
    ],
}

_COMPILED_CAT: dict[str, list[re.Pattern]] = {
    cat: [re.compile(p, re.IGNORECASE) for p in pats]
    for cat, pats in _CAT_CORROBORATION.items()
}

# Universal high-value patterns
_HAS_PCT      = re.compile(r'\b\d+(?:\.\d+)?\s*%\b')
_HAS_NUMBER   = re.compile(r'\b\d+(?:[.,]\d+)?\b')
_HAS_YEAR_TGT = re.compile(r'\bby\s+20[2-5][0-9]\b', re.IGNORECASE)
_HAS_VERIF    = re.compile(
    r'(?:third[\s-]party|independent(?:ly)?|audited|certified|verified)', re.IGNORECASE
)
_SENTENCE_SPLIT = re.compile(r'(?<=[.!?])\s+|\n{2,}')
_WHITESPACE     = re.compile(r'\s+')


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _tokenize(text: str) -> frozenset[str]:
    """Return a frozen set of meaningful lowercase word tokens."""
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    return frozenset(w for w in words if w not in _STOP)


def _split_sentences(text: str) -> list[str]:
    parts = _SENTENCE_SPLIT.split(text)
    return [_WHITESPACE.sub(" ", p).strip() for p in parts if len(p.strip()) >= 20]


def _classify_evidence_type(sentence: str, category: str) -> str:
    """Classify what kind of evidence a sentence provides."""
    if _HAS_PCT.search(sentence) or re.search(r'\b\d+(?:\.\d+)?\s*(?:tonne|ton|kg|MT|MW|GW)\b', sentence, re.IGNORECASE):
        return "quantitative"
    if any(p.search(sentence) for p in _COMPILED_CAT.get("certification", [])):
        return "certification"
    if _HAS_YEAR_TGT.search(sentence):
        return "target"
    if _HAS_VERIF.search(sentence):
        return "verified_by_third_party"
    if re.search(r'\b(?:policy|strategy|framework|programme|program|plan|initiative|approach)\b', sentence, re.IGNORECASE):
        return "policy"
    return "contextual"


def _score_sentence(
    claim_tokens: frozenset[str],
    sentence:     str,
    category:     str,
) -> float:
    """
    Compute how strongly `sentence` corroborates a claim.

    Returns a score ∈ [0, 0.98].

    Components:
      - Jaccard + precision token overlap  (base)
      - Percentage present                 (+0.15)
      - Any number present                 (+0.07)
      - Year target present                (+0.08)
      - Category corroboration pattern     (+0.12, first match only)
      - Third-party verification mention   (+0.10)
    """
    sent_tokens = _tokenize(sentence)
    if not sent_tokens or not claim_tokens:
        return 0.0

    intersection = len(claim_tokens & sent_tokens)
    if intersection == 0:
        return 0.0

    union     = len(claim_tokens | sent_tokens)
    jaccard   = intersection / union
    precision = intersection / len(claim_tokens)

    score = jaccard * 0.35 + precision * 0.55

    if _HAS_PCT.search(sentence):
        score += 0.15
    elif _HAS_NUMBER.search(sentence):
        score += 0.07

    if _HAS_YEAR_TGT.search(sentence):
        score += 0.08

    for pat in _COMPILED_CAT.get(category, []):
        if pat.search(sentence):
            score += 0.12
            break

    if _HAS_VERIF.search(sentence):
        score += 0.10

    return round(min(0.98, score), 3)


def _determine_verdict(
    evidence_scores: list[float],
    original_confidence: float,
) -> tuple[str, float]:
    """
    Combine evidence scores + original detection confidence → verdict + verification confidence.

    Verdict thresholds (based on best evidence score):
      verified           ≥ 0.65
      partially_verified ≥ 0.38
      not_verified        < 0.38
    """
    if not evidence_scores:
        return "not_verified", round(max(0.10, original_confidence * 0.25), 2)

    best   = max(evidence_scores)
    mean   = sum(evidence_scores) / len(evidence_scores)
    multi  = 0.05 if len(evidence_scores) >= 3 else 0.02 if len(evidence_scores) == 2 else 0.0

    # Blend evidence quality + original detection confidence
    verification_conf = round(
        min(0.98, best * 0.55 + mean * 0.20 + original_confidence * 0.20 + multi),
        2,
    )

    if best >= 0.65:
        verdict = "verified"
    elif best >= 0.38:
        verdict = "partially_verified"
    else:
        verdict = "not_verified"

    return verdict, verification_conf


def _verdict_reason(
    verdict: str,
    evidence_count: int,
    best_score: float,
    category: str,
) -> str:
    """Human-readable explanation of the verdict."""
    if verdict == "verified":
        return (
            f"Found {evidence_count} corroborating passage(s) with strong "
            f"relevance (best score {best_score:.0%}). Claim is well supported by document text."
        )
    if verdict == "partially_verified":
        return (
            f"Found {evidence_count} related passage(s) (best score {best_score:.0%}), "
            "but supporting evidence lacks specificity — no quantitative data or "
            "third-party verification found for this claim."
        )
    return (
        "No corroborating passages found in the document text. "
        "The claim may be aspirational or appears only as a bare assertion "
        "without supporting data."
    )


# ─── Main verification function ───────────────────────────────────────────────

_MAX_EVIDENCE = 4   # Maximum evidence passages to return per claim
_MIN_SCORE    = 0.12  # Discard sentences below this threshold


def verify_claims(
    claims: list[dict],
    pages:  list[dict],
) -> list[dict]:
    """
    Verify each claim against the full document text.

    Args:
        claims: List of claim dicts (from claim_detector.detect_claims).
                Each must have: claim, page, category, confidence, keywords_matched.
        pages:  List of page dicts (from text_extractor.extract_text).
                Each must have: page, content.

    Returns:
        List of verification result dicts, one per input claim.
    """
    # Pre-split all pages into sentences (once, for efficiency)
    page_sentences: dict[int, list[str]] = {
        p["page"]: _split_sentences(p.get("content", ""))
        for p in pages
    }

    all_sentences: list[tuple[int, str]] = [
        (page_num, sentence)
        for page_num, sents in page_sentences.items()
        for sentence in sents
    ]

    results: list[dict] = []

    for claim_dict in claims:
        claim_text    = claim_dict["claim"]
        claim_page    = claim_dict["page"]
        category      = claim_dict["category"]
        orig_conf     = claim_dict.get("confidence", 0.5)

        claim_tokens = _tokenize(claim_text)

        # Score every sentence in the document (excluding the claim sentence itself)
        scored: list[tuple[float, int, str]] = []  # (score, page_num, sentence)

        for page_num, sentence in all_sentences:
            # Skip sentences that are essentially the claim itself
            norm_sent  = _WHITESPACE.sub(" ", sentence.lower())
            norm_claim = _WHITESPACE.sub(" ", claim_text.lower())
            if norm_sent == norm_claim or norm_claim in norm_sent:
                continue

            score = _score_sentence(claim_tokens, sentence, category)
            if score >= _MIN_SCORE:
                scored.append((score, page_num, sentence))

        # Sort by score desc and take top N
        scored.sort(key=lambda x: -x[0])
        top = scored[:_MAX_EVIDENCE]

        # Build evidence objects
        evidence: list[dict] = [
            {
                "text":           sent,
                "page":           pg,
                "relevance_score": round(sc, 2),
                "evidence_type":  _classify_evidence_type(sent, category),
            }
            for sc, pg, sent in top
        ]

        evidence_scores = [e["relevance_score"] for e in evidence]
        verdict, verification_conf = _determine_verdict(evidence_scores, orig_conf)
        best_score = max(evidence_scores) if evidence_scores else 0.0
        reason = _verdict_reason(verdict, len(evidence), best_score, category)

        # ─── Post-detection Gemini AI Verification Layer ──────────────────────
        # Only runs if GEMINI_API_KEY is set. Never receives full PDF — only (claim, evidence, paragraph).
        if is_gemini_available():
            top_ev_text = top[0][2] if top else ""
            pg_content = page_sentences.get(claim_page, [])
            paragraph = " ".join(pg_content[:3]) if pg_content else ""
            
            ai_res = verify_claim_with_gemini(
                claim=claim_text,
                evidence_text=top_ev_text,
                paragraph_context=paragraph,
            )
            if ai_res:
                verdict = ai_res["verdict"]
                verification_conf = ai_res["verification_confidence"]
                reason = ai_res["verdict_reason"]

        results.append({
            "claim":                   claim_text,
            "page":                    claim_page,
            "category":                category,
            "original_confidence":     orig_conf,
            "keywords_matched":        claim_dict.get("keywords_matched", []),
            "verdict":                 verdict,
            "verification_confidence": verification_conf,
            "evidence":                evidence,
            "evidence_count":          len(evidence),
            "verdict_reason":          reason,
        })

    logger.info(
        "Verified %d claims — verified: %d, partially: %d, not: %d",
        len(results),
        sum(1 for r in results if r["verdict"] == "verified"),
        sum(1 for r in results if r["verdict"] == "partially_verified"),
        sum(1 for r in results if r["verdict"] == "not_verified"),
    )
    return results


def build_verification_summary(results: list[dict]) -> dict:
    """Aggregate statistics across all verification results."""
    if not results:
        return {
            "total_claims":    0,
            "verified":        0,
            "partially_verified": 0,
            "not_verified":    0,
            "avg_verification_confidence": 0.0,
            "by_category":     {},
        }

    verdicts    = [r["verdict"] for r in results]
    conf_sum    = sum(r["verification_confidence"] for r in results)
    by_category: dict[str, dict[str, int]] = {}

    for r in results:
        cat = r["category"]
        if cat not in by_category:
            by_category[cat] = {"verified": 0, "partially_verified": 0, "not_verified": 0}
        by_category[cat][r["verdict"]] += 1

    return {
        "total_claims":                len(results),
        "verified":                    verdicts.count("verified"),
        "partially_verified":          verdicts.count("partially_verified"),
        "not_verified":                verdicts.count("not_verified"),
        "avg_verification_confidence": round(conf_sum / len(results), 2),
        "by_category":                 by_category,
    }
