"""
EcoLabel X — Gemini AI Evidence Verification Layer

Strictly lightweight post-detection verification layer.
CRITICAL CONSTRAINTS:
 1. Never receives or processes the full PDF.
 2. Only receives: (a) detected claim, (b) nearby evidence, (c) extracted paragraph/context.
 3. Uses minimal tokens (< 200 tokens per call).
 4. Falls back silently to deterministic rule-based verification if GEMINI_API_KEY is not set or request fails.
"""

import os
import json
import logging
import urllib.request
import urllib.error
from typing import Optional

logger = logging.getLogger("ecolabelx.gemini_verifier")

# Default model endpoint
DEFAULT_MODEL = "gemini-1.5-flash"

def is_gemini_available() -> bool:
    """Return True if GEMINI_API_KEY is configured in the environment."""
    return bool(os.getenv("GEMINI_API_KEY"))

def verify_claim_with_gemini(
    claim: str,
    evidence_text: str,
    paragraph_context: str,
    timeout_seconds: float = 3.5,
) -> Optional[dict]:
    """
    Verify a single claim against nearby evidence + paragraph using Gemini REST API.
    
    Payload size is minimized (<200 tokens) to ensure low latency and low cost.
    Returns None on error or missing API key so caller can fallback to rule-based logic.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    model_name = os.getenv("GEMINI_MODEL", DEFAULT_MODEL)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"

    # Truncate inputs to prevent excessive token consumption
    short_claim = claim[:250].strip()
    short_evidence = evidence_text[:400].strip() if evidence_text else "No direct evidence passage."
    short_context = paragraph_context[:500].strip() if paragraph_context else "No additional paragraph context."

    prompt = (
        "You are an expert ESG sustainability report auditor.\n"
        "Evaluate whether the provided evidence and paragraph context substantiate the claim.\n"
        "Respond STRICTLY with JSON in this format:\n"
        '{"verdict": "verified" | "partially_verified" | "not_verified", "confidence": float_0_to_1, "reason": "brief 1-sentence rationale"}\n\n'
        f"CLAIM: {short_claim}\n"
        f"EVIDENCE: {short_evidence}\n"
        f"PARAGRAPH CONTEXT: {short_context}"
    )

    request_body = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 150,
            "responseMimeType": "application/json",
        }
    }

    try:
        data_bytes = json.dumps(request_body).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data_bytes,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        with urllib.request.urlopen(req, timeout=timeout_seconds) as response:
            if response.status == 200:
                res_body = json.loads(response.read().decode("utf-8"))
                candidates = res_body.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        raw_text = parts[0].get("text", "").strip()
                        parsed = json.loads(raw_text)
                        
                        # Validate verdict values
                        verdict = parsed.get("verdict", "not_verified").lower()
                        if verdict not in ("verified", "partially_verified", "not_verified"):
                            verdict = "partially_verified"
                            
                        conf = float(parsed.get("confidence", 0.5))
                        conf = max(0.0, min(1.0, conf))
                        
                        reason = str(parsed.get("reason", "Verified via Gemini AI reasoning."))
                        
                        return {
                            "verdict": verdict,
                            "verification_confidence": round(conf, 2),
                            "verdict_reason": f"🤖 Gemini AI: {reason}",
                            "verified_by_ai": True,
                        }
    except Exception as err:
        logger.warning("Gemini AI verification skipped/failed: %s", err)
        return None

    return None
