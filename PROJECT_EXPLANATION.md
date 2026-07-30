# 🌿 EcoLabel X — Intelligent ESG & Sustainability Intelligence Platform

> **An AI-powered Enterprise Anti-Greenwashing & Compliance Audit Platform** designed to parse corporate sustainability disclosures, detect misleading environmental claims, compute carbon accounting metrics, and generate audit-ready compliance reports.

---

## 🎯 Executive Summary & Problem Solved

### The Problem
Corporate sustainability reports and product packaging are filled with environmental claims such as *"100% Eco-Friendly"*, *"Net Zero Emissions"*, or *"Sustainably Sourced"*. However:
- **Greenwashing Risk**: Up to 40% of environmental claims made online and in corporate disclosures are unsubstantiated or misleading.
- **Regulatory Pressure**: Stringent regulations like the **EU ESPR** (Ecodesign for Sustainable Products Regulation) and **FTC Green Guides** require rigorous quantitative proof and third-party verification.
- **Manual Audit Overhead**: Sustainability teams take days or weeks to manually cross-reference claims against ISO standards and multi-page ESG PDFs.

### The EcoLabel X Solution
**EcoLabel X** automates the entire ESG audit workflow in under **1.5 seconds**:
1. **Parses PDF Disclosures**: Extracts sustainability text and product claims directly from corporate PDFs.
2. **AI-Powered Claim Verification**: Uses Google Gemini AI and domain heuristic engines to verify claims against ISO 14021, ISO 14064, and FTC Green Guides.
3. **Quantifies Greenwashing Risk**: Calculates an objective **Trust Score (0–100)** and risk breakdown.
4. **Calculates Carbon Accounting**: Categorizes Scope 1 (Direct), Scope 2 (Energy), and Scope 3 (Value Chain) footprint metrics.
5. **Generates Executive Audit Reports**: Exports publication-ready A4 executive PDF reports with official letterhead, KPI scorecards, risk drivers, and auditor sign-off.

---

## 🏗️ Technical Architecture

```
Client Web App (Next.js 14 / React)
        │
        ▼ (POST /api/greenwashing/pdf)
FastAPI Backend (Python 3.10 Engine)
        │
        ├─► PyPDF2 Text Reader
        ├─► NLP & Regex Claim Detector
        ├─► Google Gemini 2.5 Flash API + ISO Verification Rules
        └─► Carbon Accounting & Trust Score Calculator
```

### Stack & Technologies
- **Frontend Framework**: Next.js 14 (App Router), React, TypeScript.
- **Styling & Aesthetics**: Modern dark glassmorphism UI, Vanilla CSS, Tailwind CSS.
- **Backend API**: FastAPI (Python), Uvicorn server, Pydantic v2 data validation schemas.
- **AI & LLM Integration**: Google Gemini 2.5 Flash API + rule-based ESG verification fallback engine.
- **PDF Processing**: `PyPDF2` text extraction & raw structure parsing.
- **Report Generator**: Custom light-theme publication-ready HTML/CSS A4 print document builder (`pdfExporter.ts`).

---

## 🚀 Core Features & Modules Overview

### 1. 📊 Executive Overview Dashboard (`/dashboard`)
- **Portfolio EcoScore**: Real-time audit trust score (0–100).
- **Carbon Footprint**: Total portfolio emissions in kilotonnes ($kt\ CO_2e$).
- **Active Eco Labels**: Extracted ISO, FSC, RE100, and organic certifications count.
- **Products Verified**: Extracted product SKUs.
- **AI Agent Network**: Real-time status cards for Verification, Carbon, Compliance, and Risk agents.

### 2. 🔍 Claim Detector & Evidence Verifier (`/dashboard/claims` & `/dashboard/verify`)
- Identifies exact claim quotes, page locations in the PDF, confidence scores, and verification status.
- Categorizes claims into *Renewable Energy*, *Carbon & GHG*, *Packaging*, *Supply Chain*, and *Water & Biodiversity*.

### 3. ⚠️ Greenwashing Risk Engine (`/dashboard/greenwashing`)
- Categorizes claims into **Verified**, **Vague**, **Unsubstantiated**, or **High Risk**.
- Highlights specific risk drivers (e.g. lack of third-party verification, missing baseline year, vague terms like "eco-friendly").

### 4. 🏷️ Dynamic Eco Labels Registry (`/dashboard/labels`)
- Extracts third-party seals (ISO 14064, ISO 14001, FSC, RE100, SBTi, EU Organic) directly from PDF disclosures.
- Displays issuer, category, status (`Verified`, `Under Review`), validity period, page number, and text excerpt.

### 5. 🍃 Carbon Accounting & Lifecycle Breakdown (`/dashboard/carbon`)
- Breakdown of **Scope 1** (Direct manufacturing & fleet), **Scope 2** (Purchased electricity/heating), and **Scope 3** (Supply chain, logistics & end-of-life).
- Tracks YoY carbon intensity reduction progress per category.

### 6. 📈 Analytics & Compliance Intelligence (`/dashboard/analytics`)
- Visualizes claim category distribution percentages.
- Calculates **Audit Compliance Index %** (EU ESPR & FTC Green Guide readiness).

### 7. 🖨️ Professional Executive PDF Audit Report (`/dashboard/audit`)
- Generates a publication-ready audit document with:
  - Official EcoLabel X Header & Document Control Metadata.
  - ISO 14021 Compliance Badge & Overall Trust Score.
  - Key Performance Scorecards (Trust Score, Risk Score, Verified Claims Ratio).
  - Verified Claims Directory Table with page numbers.
  - Greenwashing Risk Drivers & Actionable Auditor Recommendations.
  - Formal Auditor Sign-off block.

---

## 💻 One-Click How to Run Instructions

1. **Option A — One-Click Launcher**:
   - Double-click **`Open_EcoLabel_X.bat`** (or `start_app.bat`) in the project directory.
   - It starts both backend and frontend servers automatically and opens **`http://localhost:3000`** in your default web browser.

2. **Option B — Manual Launch**:
   - **Backend**:
     ```bash
     cd backend
     ..\venv\Scripts\uvicorn.exe main:app --host 0.0.0.0 --port 8000 --reload
     ```
   - **Frontend**:
     ```bash
     npm run dev
     ```
   - Open **`http://localhost:3000`** in your browser.

---

## 📽️ Demo Presentation Script (Key Talking Points)

1. *"Welcome to EcoLabel X! Today, companies face growing scrutiny over environmental claims. EcoLabel X is our automated ESG intelligence engine that audits corporate disclosures in under 1.5 seconds."*
2. *"When a user uploads a PDF report (such as an Apple or NVIDIA sustainability report), the backend extracts all text, identifies environmental claims, and runs them through our Gemini AI and ISO verification engines."*
3. *"On the Overview page, all metrics update dynamically — displaying the document's Trust Score, Scope 1-3 Carbon Footprint, extracted Certifications, and Product SKUs."*
4. *"We can explore deep-dive modules: Greenwashing Risk analysis, Carbon Accounting, and Eco Labels."*
5. *"Finally, with a single click on 'Download PDF Report', EcoLabel X produces a publication-ready, ISO-compliant executive audit document ready for compliance officers and external auditors."*
