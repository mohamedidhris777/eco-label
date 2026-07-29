# EcoLabel X — FastAPI PDF Backend

## Overview

Standalone Python microservice providing PDF upload, text extraction, and table extraction endpoints. Returns structured JSON. No AI, no database.

## Stack

| Component | Library |
|-----------|---------|
| Framework | [FastAPI](https://fastapi.tiangolo.com/) |
| ASGI server | [Uvicorn](https://www.uvicorn.org/) |
| PDF text extraction | [PyMuPDF](https://pymupdf.readthedocs.io/) (`fitz`) |
| PDF table extraction | [pdfplumber](https://github.com/jsvine/pdfplumber) |
| File upload support | [python-multipart](https://github.com/andrew-d/python-multipart) |
| Data validation | [Pydantic v2](https://docs.pydantic.dev/) |

## Quick Start

### 1. Create a virtual environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at **http://localhost:8000**.

Interactive docs: **http://localhost:8000/docs**

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Health check |
| `POST` | `/api/pdf/info` | Upload PDF → metadata + page count |
| `POST` | `/api/pdf/extract/text` | Upload PDF → per-page text blocks |
| `POST` | `/api/pdf/extract/tables` | Upload PDF → structured table data |
| `POST` | `/api/pdf/extract/all` | Upload PDF → text + tables + metadata |

### Example: Extract everything

```bash
curl -X POST http://localhost:8000/api/pdf/extract/all \
  -F "file=@sustainability_report.pdf"
```

**Response:**

```json
{
  "success": true,
  "filename": "sustainability_report.pdf",
  "size_bytes": 2048000,
  "page_count": 12,
  "metadata": {
    "title": "Sustainability Report Q2 2026",
    "author": "EcoLabel Analytics",
    "subject": "",
    "creator": "Adobe Acrobat",
    "creation_date": "2026-04-01T09:00:00",
    "modification_date": "2026-06-15T14:32:00",
    "is_encrypted": false
  },
  "text": [
    {
      "page": 1,
      "content": "Executive Summary\n\nThis report covers...",
      "word_count": 342,
      "char_count": 1984,
      "blocks": [
        {
          "text": "Executive Summary",
          "bbox": [72.0, 80.0, 340.0, 100.0],
          "block_type": "text"
        }
      ]
    }
  ],
  "tables": [
    {
      "page": 3,
      "table_index": 0,
      "columns": ["Product", "Carbon (kg CO2e)", "Eco Score"],
      "rows": [
        ["Oat Milk 1L", "1.2", "92"],
        ["Bamboo T-Shirt", "3.8", "78"]
      ],
      "row_count": 2,
      "col_count": 3,
      "bbox": [72.0, 120.0, 540.0, 280.0]
    }
  ],
  "summary": {
    "total_words": 4821,
    "total_chars": 28440,
    "total_tables": 3,
    "total_table_rows": 48,
    "pages_with_tables": [3, 7, 9]
  }
}
```

---

## Error Handling

All errors return a consistent JSON structure:

```json
{
  "success": false,
  "error": "InvalidFileType",
  "detail": "Only PDF files are accepted. Received: image/png",
  "status_code": 422
}
```

| HTTP Code | Condition |
|-----------|-----------|
| `422` | File is not a PDF |
| `422` | File is empty or corrupted |
| `413` | File exceeds 50 MB limit |
| `400` | PDF is encrypted/password-protected |
| `500` | Unexpected extraction failure |

---

## CORS

The server allows requests from `http://localhost:3000` (Next.js dev) and `http://localhost:3001` by default.

To add production origins, set the `ALLOWED_ORIGINS` environment variable:

```bash
ALLOWED_ORIGINS="https://ecolabelx.com,https://app.ecolabelx.com" uvicorn main:app
```

---

## Project Structure

```
backend/
├── main.py                   # FastAPI app, CORS, router registration
├── requirements.txt          # Python dependencies
├── README.md                 # This file
├── .gitignore
│
├── routers/
│   ├── __init__.py
│   └── pdf.py                # /api/pdf/* route handlers
│
├── services/
│   ├── __init__.py
│   ├── text_extractor.py     # PyMuPDF text extraction logic
│   └── table_extractor.py    # pdfplumber table extraction logic
│
└── models/
    ├── __init__.py
    └── schemas.py            # Pydantic request/response models
```
