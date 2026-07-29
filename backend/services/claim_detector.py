"""
EcoLabel X — Sustainability Claim Detector
Rule-based detection using compiled regex patterns.
No AI, no database — pure text matching + confidence scoring.

Categories: carbon | renewable_energy | recycling | water |
            biodiversity | supply_chain | packaging | certification | targets
"""

from __future__ import annotations
import re
import logging

logger = logging.getLogger("ecolabelx.claim_detector")


# ─── Pattern taxonomy ─────────────────────────────────────────────────────────


CATEGORY_PATTERNS: dict[str, list[str]] = {
    "carbon": [
        r"\bcarbon[\s-]neutral\b",
        r"\bnet[\s-]zero\b",
        r"\bcarbon\s+footprint\b",
        r"\b(?:GHG|greenhouse[\s-]gas)\s+emis[s]ions\b",
        r"\bscope\s+[123]\s+emis[s]ions\b",
        r"\bCO2[\s-]?(?:e|equivalent)?\b",
        r"\bcarbon\s+offset[s]?\b",
        r"\bcarbon\s+(?:emis[s]ions|reduction|removal|sequestration)\b",
        r"\bclimate[\s-]positive\b",
        r"\bcarbon[\s-]negative\b",
        r"\bSBTi\b",
        r"\bscience[\s-]based\s+target[s]?\b",
        r"\bParis\s+Agreement\b",
        r"\bcarbon\s+accounting\b",
    ],
    "renewable_energy": [
        r"\brenewable\s+energy\b",
        r"\bsolar\s+(?:power|energy|panel[s]?|farm)\b",
        r"\bwind\s+(?:energy|power|turbine[s]?|farm)\b",
        r"\bgreen\s+(?:energy|electricity|tariff)\b",
        r"\b100\s*%\s*renewable\b",
        r"\bclean\s+energy\b",
        r"\bhydropower\b",
        r"\bgeothermal\b",
        r"\bRECs?\b",
        r"\brenewable\s+energy\s+certificate[s]?\b",
        r"\bPPA\b",
        r"\bpower\s+purchase\s+agreement[s]?\b",
    ],
    "recycling": [
        r"\brecycled\s+content\b",
        r"\brecyclable\b",
        r"\bcircular\s+economy\b",
        r"\bwaste\s+reduction\b",
        r"\bzero[\s-]waste\b",
        r"\bupcycled?\b",
        r"\bpost[\s-]consumer\s+(?:recycled|waste|material)\b",
        r"\bPCR\b",
        r"\bwaste\s+diversion\b",
        r"\bclose[d]?[\s-]loop\b",
        r"\brecycle[d]?\b",
        r"\bwaste\s+(?:to\s+energy|recovery)\b",
    ],
    "water": [
        r"\bwater\s+stewardship\b",
        r"\bwater[\s-]neutral\b",
        r"\bwater\s+efficiency\b",
        r"\bwater\s+footprint\b",
        r"\bwater\s+conservation\b",
        r"\bwater\s+(?:withdrawal|consumption|usage)\s+reduc\w+\b",
        r"\bfreshwater\s+(?:withdrawal|stewardship)\b",
        r"\bwater\s+recycl\w+\b",
        r"\bwater\s+scarcity\b",
        r"\bAWS\s+certified\b",
        r"\bAlliance\s+for\s+Water\s+Stewardship\b",
    ],
    "biodiversity": [
        r"\bbiodiversity\b",
        r"\bdeforestation[\s-]free\b",
        r"\bno\s+deforestation\b",
        r"\bRSPO\b",
        r"\bwildlife\s+(?:protection|habitat|corridor|friendly)\b",
        r"\becosystem\s+(?:service[s]?|protection|restoration|health)\b",
        r"\bhabitat\s+(?:preservation|restoration|creation)\b",
        r"\bforest\s+(?:protection|conservation|stewardship)\b",
        r"\bspecies\s+(?:protection|conservation)\b",
        r"\bTNFD\b",
        r"\bnature[\s-]positive\b",
        r"\bland\s+restoration\b",
    ],
    "supply_chain": [
        r"\bethical\s+sourcing\b",
        r"\bfair[\s-]trade\b",
        r"\bFairtrade\b",
        r"\bsustainable\s+sourcing\b",
        r"\bresponsible\s+sourcing\b",
        r"\bsupply[\s-]chain\s+(?:transparency|sustainability|traceability|audit)\b",
        r"\btraceability\b",
        r"\bsupplier\s+(?:code\s+of\s+conduct|standards|audit|engagement)\b",
        r"\bchild\s+labour\b",
        r"\bmodern\s+slavery\b",
        r"\bliving\s+wage\b",
        r"\bSA8000\b",
    ],
    "packaging": [
        r"\bsustainable\s+packaging\b",
        r"\bplastic[\s-]free\b",
        r"\bcompostable\b",
        r"\bbiodegradable\b",
        r"\bpackaging\s+reduction\b",
        r"\brefillable\b",
        r"\bpackaging[\s-]free\b",
        r"\bminimal\s+packaging\b",
        r"\brecycled\s+packaging\b",
        r"\bpackaging\s+(?:weight\s+reduction|lightweighting)\b",
        r"\bEPR\b",
        r"\bextended\s+producer\s+responsibility\b",
    ],
    "certification": [
        r"\bISO\s*14001\b",
        r"\bISO\s*50001\b",
        r"\bEU\s+Ecolabel\b",
        r"\bFSC(?:\s+certified)?\b",
        r"\bRainforest\s+Alliance\b",
        r"\bB\s+Corp(?:oration)?\b",
        r"\bLEED(?:\s+certified)?\b",
        r"\bBREEAM\b",
        r"\borganic\s+certif\w+\b",
        r"\bCradle[\s-]to[\s-]Cradle\b",
        r"\bGOTS\b",
        r"\bGlobal\s+Organic\s+Textile\s+Standard\b",
        r"\bEPD\b",
        r"\bEnvironmental\s+Product\s+Declaration\b",
        r"\bCarbon\s+Trust\s+certified\b",
    ],
    "targets": [
        r"\bby\s+20[2-5][0-9]\b",
        r"\btarget[s]?\s+(?:of|to)\b",
        r"\bcommit(?:ted|ment)\s+to\b",
        r"\bpledge[d]?\s+to\b",
        r"\baim[s]?\s+to\b",
        r"\bgoal[s]?\s+(?:of|to)\b",
        r"\breduce\s+\w+\s+by\s+\d+\s*%\b",
        r"\b\d+\s*%\s*reduc(?:tion|e)\b",
        r"\bhalve\b",
        r"\bdouble\b",
        r"\babsolute\s+reduction\s+target\b",
    ],
}

# Vague language — penalises confidence
_VAGUE = [
    r"\beco[\s-]friendly\b",
    r"\benvironmentally\s+friendly\b",
    r"\bgreen\b",
    r"\bnatural\b",
    r"\bclean\b",
]

# High-specificity indicators — boost confidence
_SPECIFIC = [
    r"\b\d+(?:\.\d+)?\s*%\b",
    r"\b\d+(?:\.\d+)?\s*(?:tonne[s]?|ton[s]?|kg|MT|ktCO2e)\b",
    r"\bby\s+20[2-5][0-9]\b",
    r"\bthird[\s-]party\s+(?:verified|audited|certified)\b",
    r"\bindependent(?:ly)?\s+(?:verified|audited)\b",
]

# Pre-compile all patterns for performance
_COMPILED: dict[str, list[re.Pattern]] = {
    cat: [re.compile(p, re.IGNORECASE) for p in pats]
    for cat, pats in CATEGORY_PATTERNS.items()
}
_COMPILED_VAGUE    = [re.compile(p, re.IGNORECASE) for p in _VAGUE]
_COMPILED_SPECIFIC = [re.compile(p, re.IGNORECASE) for p in _SPECIFIC]

# Sentence splitter
_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+|\n{2,}")
_WHITESPACE     = re.compile(r"\s+")


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _clean(text: str) -> str:
    return _WHITESPACE.sub(" ", text).strip()


def _split_sentences(text: str) -> list[str]:
    """Split page text into candidate claim sentences."""
    raw = _SENTENCE_SPLIT.split(text)
    return [_clean(s) for s in raw if len(_clean(s)) >= 20]


def _confidence(
    sentence: str,
    category: str,
    n_keywords: int,
) -> float:
    """
    Compute confidence ∈ [0.25, 0.98].

    Base 0.50 — adjusted by:
      +0.05 per additional keyword hit (max +0.15)
      +0.10 for ≥1 specificity indicator (number/%, year, tonnage)
      +0.08 for year-based target in sentence
      +0.15 for third-party verification mention
      +0.12 for certification category
      −0.08 per vague-language hit (max −0.16)
    """
    conf = 0.50

    # Keyword density bonus
    conf += min((n_keywords - 1), 3) * 0.05

    # Specificity bonuses
    for pat in _COMPILED_SPECIFIC:
        if pat.search(sentence):
            conf += 0.10
            break

    if re.search(r"\bby\s+20[2-5][0-9]\b", sentence, re.IGNORECASE):
        conf += 0.08

    if re.search(
        r"(?:third[\s-]party|independent(?:ly)?)\s+(?:verified|audited|certified)",
        sentence, re.IGNORECASE
    ):
        conf += 0.15

    if category == "certification":
        conf += 0.12

    # Vague language penalty
    vague_hits = sum(1 for p in _COMPILED_VAGUE if p.search(sentence))
    conf -= min(vague_hits, 2) * 0.08

    return round(min(0.98, max(0.25, conf)), 2)


# ─── Main detection function ──────────────────────────────────────────────────

def detect_claims(pages: list[dict]) -> list[dict]:
    """
    Detect sustainability claims from extracted page text.

    Args:
        pages: List of dicts with at least ``{"page": int, "content": str}``.

    Returns:
        Sorted list of claim dicts:
        {claim, page, confidence, category, keywords_matched}
    """
    claims:     list[dict] = []
    seen:       set[str]   = set()   # deduplicate by normalised claim

    for page_data in pages:
        page_num: int = page_data.get("page", 1)
        content:  str = page_data.get("content", "")

        if not content.strip():
            continue

        sentences = _split_sentences(content)

        for sentence in sentences:
            # Score sentence against every category
            best_category:  str | None = None
            best_keywords:  list[str]  = []
            best_hit_count: int        = 0

            for category, patterns in _COMPILED.items():
                hits = [
                    m.group(0)
                    for pat in patterns
                    for m in pat.finditer(sentence)
                ]
                if len(hits) > best_hit_count:
                    best_hit_count = len(hits)
                    best_category  = category
                    best_keywords  = hits

            if not best_category or best_hit_count == 0:
                continue

            # Deduplicate
            key = _WHITESPACE.sub(" ", sentence.lower())
            if key in seen:
                continue
            seen.add(key)

            conf = _confidence(sentence, best_category, best_hit_count)

            claims.append({
                "claim":            sentence,
                "page":             page_num,
                "confidence":       conf,
                "category":         best_category,
                "keywords_matched": list({kw.strip().lower() for kw in best_keywords}),
            })

    # Sort: page asc, confidence desc
    claims.sort(key=lambda c: (c["page"], -c["confidence"]))
    logger.info("Detected %d sustainability claims across %d pages", len(claims), len(pages))
    return claims


def build_claims_summary(claims: list[dict]) -> dict:
    """Aggregate statistics for a set of detected claims."""
    if not claims:
        return {
            "total_claims":           0,
            "by_category":            {},
            "avg_confidence":         0.0,
            "high_confidence_count":  0,
            "pages_with_claims":      [],
        }

    by_category: dict[str, int] = {}
    pages: set[int] = set()
    conf_sum = 0.0
    high = 0

    for c in claims:
        by_category[c["category"]] = by_category.get(c["category"], 0) + 1
        pages.add(c["page"])
        conf_sum += c["confidence"]
        if c["confidence"] >= 0.75:
            high += 1

    return {
        "total_claims":           len(claims),
        "by_category":            by_category,
        "avg_confidence":         round(conf_sum / len(claims), 2),
        "high_confidence_count":  high,
        "pages_with_claims":      sorted(pages),
    }
