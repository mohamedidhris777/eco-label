"""
EcoLabel X — FastAPI PDF Backend
Entry point: registers routers, configures CORS, and mounts the app.
"""

import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv

# Ensure backend directory is in sys.path for linter & runtime resolution
_backend_dir = Path(__file__).parent.resolve()
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import pdf, claims, verification, greenwashing, ai

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("ecolabelx.main")

# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="EcoLabel X — PDF API",
    description=(
        "Upload PDF sustainability reports and receive structured JSON containing "
        "extracted text, tables, and document metadata. No AI, no database."
    ),
    version="1.0.0",
    contact={
        "name": "EcoLabel X",
        "url":  "https://ecolabelx.com",
    },
    license_info={
        "name": "MIT",
    },
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────

_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001",
)
allowed_origins: list[str] = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("CORS origins: %s", allowed_origins)

# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(pdf.router,           prefix="/api/pdf",          tags=["PDF"])
app.include_router(claims.router,        prefix="/api/claims",       tags=["Claims"])
app.include_router(verification.router,  prefix="/api/verify",       tags=["Verification"])
app.include_router(greenwashing.router,  prefix="/api/greenwashing", tags=["Greenwashing"])
app.include_router(ai.router,            prefix="/api/ai",           tags=["AI Engine"])

# ─── Health check ─────────────────────────────────────────────────────────────

@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
    response_description="Service status",
)
def health() -> dict:
    """Returns 200 when the service is running."""
    return {"status": "ok", "service": "ecolabelx-pdf-api", "version": "1.0.0"}


@app.get("/", include_in_schema=False)
def root() -> dict:
    return {"message": "EcoLabel X PDF API — visit /docs for interactive documentation"}
