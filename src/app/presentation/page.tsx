/**
 * EcoLabel X — Interactive 25-Slide World-Class Presentation Page
 * Route: /presentation
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";

interface SlideData {
  id: number;
  category: string;
  title: string;
  say: string;
  click: string;
  pause: string;
  judges: string;
  items: Array<{ val: string; title: string; desc: string; color: string }>;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    category: "Cover",
    title: "EcoLabel X — AI-Powered Sustainability Intelligence Platform",
    say: "Good morning judges! Today we present EcoLabel X, an enterprise AI platform that solves greenwashing and automates ESG audits in under 1.5 seconds.",
    click: "Click once or press Right Arrow to advance to Slide 2.",
    pause: "Pause 2 seconds after reading the title to let judges take in the branding.",
    judges: "Judges should notice the sleek Fortune 500 dark theme and clear product positioning.",
    items: [
      { val: "EcoLabel X", title: "Enterprise Anti-Greenwashing Audit Engine", desc: "Automates multi-page corporate disclosure audits, carbon accounting, and compliance reports.", color: "#00ffaa" }
    ]
  },
  {
    id: 2,
    category: "Market Friction",
    title: "The Core Problem in Sustainability Disclosures",
    say: "Sustainability reporting is broken. Companies produce 100-page disclosures, auditors spend weeks checking claims, and greenwashing is at an all-time high.",
    click: "Click 4 times — one click per problem card.",
    pause: "Pause after revealing 'Regulatory Enforcement' to emphasize urgency.",
    judges: "Judges will see that we understand the quantitative friction in corporate compliance.",
    items: [
      { val: "100+ Pages", title: "Massive Volume", desc: "Companies produce hundreds of pages of unstructured ESG disclosures filled with complex tables.", color: "#ef4444" },
      { val: "2+ Weeks", title: "Manual Audit Friction", desc: "Compliance officers take weeks to manually cross-reference claims against ISO standards.", color: "#ffb300" },
      { val: "40%", title: "Surge in Greenwashing", desc: "Over 40% of environmental claims made online & in disclosures are vague or unsubstantiated.", color: "#ef4444" },
      { val: "Strict Fines", title: "Regulatory Enforcement", desc: "Stringent laws like EU ESPR & FTC Green Guides mandate quantitative proof.", color: "#9b59ff" }
    ]
  },
  {
    id: 3,
    category: "Our Innovation",
    title: "Introducing EcoLabel X: Instant ESG Intelligence",
    say: "EcoLabel X turns weeks of manual auditing into a 1.5-second automated workflow. Upload a PDF, and our 4 AI Agents verify claims and generate compliance reports.",
    click: "Click 4 times to reveal each solution pillar sequentially.",
    pause: "Pause after the 4th pillar to let the complete solution vision land.",
    judges: "Judges will notice end-to-end automation from PDF input to executive PDF export.",
    items: [
      { val: "1-Click", title: "PDF Disclosure Upload", desc: "Parses multi-page ESG disclosures in <1.5s.", color: "#00ffaa" },
      { val: "100%", title: "AI Claim Extraction", desc: "Identifies exact text quotes, page numbers & keywords.", color: "#00c8ff" },
      { val: "4 Agents", title: "Multi-Agent AI Network", desc: "Verification, Carbon, Compliance & Risk agents run in parallel.", color: "#9b59ff" },
      { val: "A4 PDF", title: "Executive Audit Report", desc: "Generates publication-ready executive audit reports.", color: "#ffb300" }
    ]
  },
  {
    id: 4,
    category: "Execution Flow",
    title: "8-Stage Pipeline Workflow",
    say: "Here is our end-to-end execution flow. From raw PDF upload to text extraction, 4-agent parallel evaluation, and instant PDF report generation.",
    click: "Click 8 times — one step per click to build the pipeline progressively.",
    pause: "Pause after step 5 to explain the 4 AI Agents orchestration.",
    judges: "Judges will appreciate the clean, modular architecture build.",
    items: [
      { val: "01", title: "Upload PDF", desc: "Drag & drop report", color: "#00c8ff" },
      { val: "02", title: "PDF Processing", desc: "PyPDF2 text parsing", color: "#00ffaa" },
      { val: "03", title: "Text Extraction", desc: "Clean structure", color: "#00c8ff" },
      { val: "04", title: "Claim Detection", desc: "Regex & NLP tags", color: "#9b59ff" },
      { val: "05", title: "4 AI Agents", desc: "Parallel analysis", color: "#ffb300" },
      { val: "06", title: "Results Engine", desc: "Score calculation", color: "#00ffaa" },
      { val: "07", title: "Dashboard", desc: "Live visual data", color: "#00c8ff" },
      { val: "08", title: "Audit Report", desc: "Executive PDF export", color: "#00ffaa" }
    ]
  },
  {
    id: 5,
    category: "System Design",
    title: "High-Performance Technical Architecture",
    say: "Our technical architecture connects Next.js 14 on the frontend to FastAPI on the backend, processing PDFs via PyPDF2 and Gemini 2.5 Flash in under 1.5 seconds.",
    click: "Click 6 times to reveal each architectural component block.",
    pause: "Pause on Gemini 2.5 Flash to highlight LLM reasoning combined with deterministic fallback rules.",
    judges: "Judges will observe technical rigor, fast async performance, and enterprise scalability.",
    items: [
      { val: "UI Layer", title: "Next.js 14 Web App", desc: "React, TypeScript, Glassmorphism UI", color: "#00ffaa" },
      { val: "API Layer", title: "FastAPI Backend", desc: "Python 3.10, Uvicorn Async Server", color: "#00c8ff" },
      { val: "Parser", title: "PyPDF2 Text Engine", desc: "Raw PDF structure & table reader", color: "#9b59ff" },
      { val: "AI Layer", title: "Google Gemini 2.5 Flash", desc: "LLM reasoning + ISO 14021 rules", color: "#ffb300" },
      { val: "Analytics", title: "Carbon & Risk Engine", desc: "Scope 1-3 & Trust Score matrix", color: "#00ffaa" },
      { val: "Export", title: "Executive PDF Generator", desc: "Publication-ready A4 exporter", color: "#00c8ff" }
    ]
  },
  {
    id: 6,
    category: "AI Core Network",
    title: "Multi-Agent Orchestration Engine",
    say: "EcoLabel X deploys four specialized AI agents that run concurrently on every uploaded document: Verification, Carbon, Compliance, and Risk.",
    click: "Click 4 times — reveal one agent card per click.",
    pause: "Pause after revealing all 4 agents to summarize their synergy.",
    judges: "Judges will notice multi-agent architecture handling distinct domain responsibilities.",
    items: [
      { val: "Agent 1", title: "Verification Agent", desc: "Cross-references 400+ certification databases & ISO standards.", color: "#00ffaa" },
      { val: "Agent 2", title: "Carbon Agent", desc: "Scope 1, 2 & 3 lifecycle carbon accounting engine.", color: "#00c8ff" },
      { val: "Agent 3", title: "Compliance Agent", desc: "EU ESPR & FTC Green Guide regulatory readiness tracker.", color: "#9b59ff" },
      { val: "Agent 4", title: "Risk Agent", desc: "Detects vague, misleading, and unsubstantiated claims.", color: "#ef4444" }
    ]
  },
  {
    id: 7,
    category: "Agent Deep-Dive",
    title: "Verification Agent: ISO & Database Matching",
    say: "The Verification Agent analyzes exact claim quotes, page references, and assigns confidence scores from Verified to Under Review.",
    click: "Click 4 times to reveal each section of the Verification Agent deep-dive.",
    pause: "Pause on Status Metrics to explain confidence thresholds.",
    judges: "Judges will note rigorous evidence-backed verification rather than simple sentiment analysis.",
    items: [
      { val: "Core Goal", title: "Purpose & Focus", desc: "Cross-references disclosures against ISO 14021 & certification registries.", color: "#00ffaa" },
      { val: "4-Step", title: "Execution Workflow", desc: "Identifies claim -> Extracts evidence -> Matches issuer -> Assigns status.", color: "#00c8ff" },
      { val: ">75%", title: "Status Metrics", desc: "Verified (Confidence > 75%) | Under Review (50-75%) | Unverified (<50%).", color: "#9b59ff" },
      { val: "ISO 14064", title: "Output Example", desc: "ISO 14064 GHG Verified (TÜV SÜD) -> Verified (Page 2).", color: "#ffb300" }
    ]
  },
  {
    id: 8,
    category: "Agent Deep-Dive",
    title: "Carbon Agent: Scope 1, 2 & 3 Accounting Engine",
    say: "Our Carbon Agent parses Scope 1 direct, Scope 2 energy, and Scope 3 value chain disclosures, computing total kilotonnes of CO2e automatically.",
    click: "Click 4 times — one per scope and the YoY intensity calculator.",
    pause: "Pause on Scope 3 to highlight value chain calculation complexity.",
    judges: "Judges will appreciate automated GHG Protocol alignment.",
    items: [
      { val: "Scope 1", title: "Direct Operations", desc: "Onsite manufacturing, stationary combustion, fleet operations.", color: "#00ffaa" },
      { val: "Scope 2", title: "Purchased Energy", desc: "Purchased electricity, steam, facility heating & cooling.", color: "#00c8ff" },
      { val: "Scope 3", title: "Value Chain Impact", desc: "Raw material procurement, freight distribution, end-of-life.", color: "#9b59ff" },
      { val: "-24% YoY", title: "Intensity Reductions", desc: "Calculates percentage reductions across packaging & supply chain.", color: "#ffb300" }
    ]
  },
  {
    id: 9,
    category: "Agent Deep-Dive",
    title: "Compliance Agent: EU ESPR & FTC Green Guides",
    say: "The Compliance Agent monitors EU ESPR and FTC Green Guide requirements, generating an Audit Compliance Index score to prevent legal exposure.",
    click: "Click 4 times to reveal each compliance check module.",
    pause: "Pause on Audit Compliance Index to explain compliance readiness scoring.",
    judges: "Judges will see immediate real-world regulatory utility for enterprise risk teams.",
    items: [
      { val: "EU ESPR", title: "Ecodesign Regulation", desc: "Monitors Ecodesign for Sustainable Products Regulation audit readiness.", color: "#00ffaa" },
      { val: "FTC", title: "Green Guide Alignment", desc: "Ensures environmental claims meet US Federal Trade Commission standards.", color: "#00c8ff" },
      { val: "0-100%", title: "Compliance Index", desc: "Calculates dynamic compliance score based on verified claims ratio.", color: "#9b59ff" },
      { val: "Checklist", title: "Regulatory Verification", desc: "Flags missing mandatory quantitative proof before submission.", color: "#ffb300" }
    ]
  },
  {
    id: 10,
    category: "Agent Deep-Dive",
    title: "Risk Agent: Misleading Claim & Vague Term Detector",
    say: "Our Risk Agent exposes greenwashing by flagging vague terms, missing baseline years, and unbacked claims, producing an actionable risk score.",
    click: "Click 4 times — one per risk component.",
    pause: "Pause on Vague Term Detection to give examples like '100% eco-friendly'.",
    judges: "Judges will recognize the anti-greenwashing core of our platform.",
    items: [
      { val: "Vague", title: "Buzzword Detection", desc: "Flags terms like 'eco-friendly', 'green', and 'pure' without data.", color: "#ef4444" },
      { val: "Baseline", title: "Missing Year Flags", desc: "Detects reduction claims that lack a declared baseline year.", color: "#ffb300" },
      { val: "0-100", title: "Risk Scoring Matrix", desc: "Objective 0-100 risk score (Low, Medium, High Risk).", color: "#00c8ff" },
      { val: "Mitigate", title: "Auditor Guidance", desc: "Generates concrete corrective action steps for compliance officers.", color: "#00ffaa" }
    ]
  },
  {
    id: 11,
    category: "Product Experience",
    title: "Centralized Overview Dashboard UI",
    say: "The Overview Dashboard provides executive visibility — displaying EcoScore, Carbon Footprint, active AI agents, and single-click PDF upload.",
    click: "Click 4 times to reveal each UI widget zone.",
    pause: "Pause after revealing all 4 zones to showcase design polish.",
    judges: "Judges will notice the clean glassmorphic UI layout.",
    items: [
      { val: "Top KPIs", title: "Scorecards Grid", desc: "Portfolio EcoScore, Carbon Footprint, Active Labels, SKUs.", color: "#00ffaa" },
      { val: "4 Agents", title: "AI Status Cards", desc: "Real-time task monitor for 4 active backend agents.", color: "#00c8ff" },
      { val: "Widgets", title: "Trust & Carbon Score", desc: "Interactive Trust Score ring & 12-month carbon trend.", color: "#9b59ff" },
      { val: "Upload", title: "Dropzone & History", desc: "Instant drag-and-drop PDF dropzone + upload history.", color: "#ffb300" }
    ]
  },
  {
    id: 12,
    category: "Product Intelligence",
    title: "Automated Product & SKU Extraction",
    say: "In the Products Module, EcoLabel X automatically extracts individual product SKUs, assigns carbon footprint metrics, and tracks verification status.",
    click: "Click 4 times to reveal product extraction steps.",
    pause: "Pause on Carbon Impact to emphasize item-level ESG granular tracking.",
    judges: "Judges will see how ESG data connects to physical product SKUs.",
    items: [
      { val: "SKUs", title: "Automated Extraction", desc: "Extracts product names & SKUs directly from PDF disclosures.", color: "#00ffaa" },
      { val: "Categories", title: "Classification Engine", desc: "Groups items into Electronics, Packaging, Agriculture & Materials.", color: "#00c8ff" },
      { val: "Impact", title: "Unit Carbon Footprint", desc: "Assigns estimated product carbon intensity footprint.", color: "#9b59ff" },
      { val: "Status", title: "Verification Tracking", desc: "Displays Verified vs Pending review status per product.", color: "#ffb300" }
    ]
  },
  {
    id: 13,
    category: "Claim Detector",
    title: "NLP & Keyword Claim Extraction Pipeline",
    say: "Our Claim Detector extracts exact text quotes from disclosures and pinpoints their exact page number for instant audit verification.",
    click: "Click 4 times — one per claim extraction stage.",
    pause: "Pause on Page Number Mapping to highlight audit traceability.",
    judges: "Judges will note exact page traceability for corporate compliance.",
    items: [
      { val: "Quotes", title: "Exact Text Snippets", desc: "Extracts exact environmental text snippets from disclosures.", color: "#00ffaa" },
      { val: "Pages", title: "PDF Page Mapping", desc: "Pinpoints exact PDF page location for auditor inspection.", color: "#00c8ff" },
      { val: "Keywords", title: "Matched Term Tags", desc: "Identifies matched terms like 'RE100', 'net zero', 'recycled'.", color: "#9b59ff" },
      { val: "Score", title: "AI Confidence Rating", desc: "Assigns AI confidence score (0-100%) to every extracted claim.", color: "#ffb300" }
    ]
  },
  {
    id: 14,
    category: "Evidence Verifier",
    title: "Automated ISO & Standards Verification",
    say: "The Evidence Verifier validates claims against ISO standards and provides clear written rationales explaining why a claim passed or failed.",
    click: "Click 4 times to reveal evidence verification flow.",
    pause: "Pause on Rationale Generation to explain explainable AI logic.",
    judges: "Judges will appreciate transparent, explainable AI decisions.",
    items: [
      { val: "Evidence", title: "Quantitative Search", desc: "Searches quantitative data within the report to back claims.", color: "#00ffaa" },
      { val: "ISO Rules", title: "Self-Declaration Check", desc: "Validates claims against ISO 14021 environmental self-declarations.", color: "#00c8ff" },
      { val: "Rationale", title: "AI Explanation Logic", desc: "Generates clear AI explanation for why a claim is verified or flagged.", color: "#9b59ff" },
      { val: "Badges", title: "Status Output", desc: "Outputs Verified, Under Review, or Unverified status badges.", color: "#ffb300" }
    ]
  },
  {
    id: 15,
    category: "Risk Analyzer",
    title: "Greenwashing Risk Matrix & Recommendations",
    say: "The Greenwashing Analyzer categorizes overall document risk, pinpoints missing evidence, and provides concrete mitigation steps.",
    click: "Click 4 times to reveal risk analyzer components.",
    pause: "Pause on Missing Evidence List to show how missing proof is detected.",
    judges: "Judges will see actionable risk mitigation for enterprise leaders.",
    items: [
      { val: "Levels", title: "Risk Classification", desc: "Categorizes overall risk into Low, Medium, or High Risk.", color: "#ef4444" },
      { val: "Drivers", title: "Risk Drivers Breakdown", desc: "Lists specific reasons (e.g. unverified packaging claim).", color: "#ffb300" },
      { val: "Missing", title: "Proof Gap Detector", desc: "Flags missing third-party certificates or audit documents.", color: "#00c8ff" },
      { val: "Action", title: "Mitigation Guidance", desc: "Provides prioritized recommendation steps for risk mitigation.", color: "#00ffaa" }
    ]
  },
  {
    id: 16,
    category: "Carbon Analytics",
    title: "Scope 1, 2 & 3 Footprint Visualization",
    say: "On the Carbon Dashboard, users explore interactive Scope 1, 2, and 3 emissions breakdowns and monitor carbon reduction progress.",
    click: "Click 4 times — reveal each emission scope component.",
    pause: "Pause after all 4 cards appear to highlight full GHG scope coverage.",
    judges: "Judges will notice comprehensive carbon accounting alignment.",
    items: [
      { val: "Scope 1", title: "Direct Emissions", desc: "Onsite manufacturing & facility emissions (kt CO2e).", color: "#00ffaa" },
      { val: "Scope 2", title: "Energy Emissions", desc: "Purchased electricity & heating emissions (kt CO2e).", color: "#00c8ff" },
      { val: "Scope 3", title: "Value Chain Impact", desc: "Raw material, freight & distribution emissions (kt CO2e).", color: "#9b59ff" },
      { val: "Progress", title: "YoY Intensity Target", desc: "Visual progress bars tracking YoY carbon reduction targets.", color: "#ffb300" }
    ]
  },
  {
    id: 17,
    category: "Compliance Analytics",
    title: "Category Distribution & Audit Index",
    say: "Our Analytics Module calculates claim category distributions and computes an Audit Compliance Index score for regulatory readiness.",
    click: "Click 4 times to build the analytics view.",
    pause: "Pause on Audit Compliance Index to explain compliance scoring logic.",
    judges: "Judges will observe high-level executive analytics paired with granular metrics.",
    items: [
      { val: "Categories", title: "Claim Distribution", desc: "Visual breakdown of claims across Energy, Carbon, Packaging, and Supply Chain.", color: "#00ffaa" },
      { val: "Index", title: "Compliance Rating", desc: "Dynamic score evaluating EU ESPR & FTC Green Guide readiness.", color: "#00c8ff" },
      { val: "Rate", title: "Verification Ratio", desc: "Displays percentage of total claims backed by quantitative proof.", color: "#9b59ff" },
      { val: "Readiness", title: "Audit Rating", desc: "Categorizes overall audit readiness from High to Action Needed.", color: "#ffb300" }
    ]
  },
  {
    id: 18,
    category: "Certification Registry",
    title: "Automated Eco Label Identification",
    say: "The Eco Labels Registry automatically detects third-party certifications (ISO 14064, FSC, RE100, EU Organic) from disclosures, verifying validity and page excerpts.",
    click: "Click 4 times — one per eco label category.",
    pause: "Pause on ISO 14064 to explain GHG verification standard matching.",
    judges: "Judges will see how certification detection eliminates manual registry searching.",
    items: [
      { val: "ISO 14064", title: "GHG Verification Seal", desc: "TÜV SÜD / WRI Emissions Assurance Mark", color: "#00ffaa" },
      { val: "FSC Paper", title: "Packaging Certification", desc: "Forest Stewardship Council Chain of Custody", color: "#00c8ff" },
      { val: "RE100", title: "Renewable Power Mark", desc: "Climate Group 100% Clean Energy Mark", color: "#9b59ff" },
      { val: "Organic", title: "Fairtrade & EU Organic", desc: "European Commission & Fairtrade International", color: "#ffb300" }
    ]
  },
  {
    id: 19,
    category: "Executive Reporting",
    title: "Publication-Ready A4 PDF Report Exporter",
    say: "With one click on 'Download PDF', EcoLabel X exports a publication-ready A4 executive audit document complete with letterhead, scorecards, and auditor sign-off.",
    click: "Click 4 times to reveal PDF report sections.",
    pause: "Pause after all 4 cards appear to emphasize PDF export polish.",
    judges: "Judges will see an end-to-end usable product that delivers a tangible PDF artifact.",
    items: [
      { val: "Header", title: "Official Letterhead", desc: "EcoLabel X header with ISO 14021 compliance seal & metadata.", color: "#00ffaa" },
      { val: "Scorecard", title: "KPI Summary Grid", desc: "Overall Trust Score, Risk Score, Claims Ratio scorecard grid.", color: "#00c8ff" },
      { val: "Directory", title: "Claims Directory Table", desc: "Complete table of verified & flagged claims with PDF page numbers.", color: "#9b59ff" },
      { val: "Sign-off", title: "Auditor Signature Block", desc: "Prioritized recommendations & formal auditor signature section.", color: "#ffb300" }
    ]
  },
  {
    id: 20,
    category: "Engineering Core",
    title: "Modern Full-Stack Technology Suite",
    say: "Our technology stack leverages Next.js 14, FastAPI, Python, PyPDF2, and Google Gemini 2.5 Flash API for high-speed, enterprise-grade AI execution.",
    click: "Click 4 times — one per technology pillar.",
    pause: "Pause on Gemini 2.5 Flash to highlight LLM integration.",
    judges: "Judges will recognize production-ready, modern open-source technologies.",
    items: [
      { val: "Next.js 14", title: "Frontend Framework", desc: "React, TypeScript, Glassmorphic UI framework", color: "#00ffaa" },
      { val: "FastAPI", title: "Async Backend Server", desc: "Async Python 3.10 server with Pydantic v2 schemas", color: "#00c8ff" },
      { val: "Gemini 2.5", title: "Generative AI LLM", desc: "Google Gemini 2.5 Flash LLM reasoning & claim analysis", color: "#9b59ff" },
      { val: "PyPDF2", title: "PDF & Exporter Engine", desc: "Raw PDF extraction & A4 publication exporter", color: "#ffb300" }
    ]
  },
  {
    id: 21,
    category: "Competitive Edge",
    title: "Why EcoLabel X Is Unique",
    say: "What makes EcoLabel X unique is sub-2-second speed, 4-agent parallel evaluation, 100% page-traceable evidence, and instant executive PDF generation.",
    click: "Click 4 times to reveal key innovations.",
    pause: "Pause on Evidence-Backed Scoring to reinforce trust.",
    judges: "Judges will see clear differentiation from simple chatbots or basic scanners.",
    items: [
      { val: "<1.5s", title: "Instant Execution Speed", desc: "Replaces days of manual PDF auditing with instant analysis.", color: "#00ffaa" },
      { val: "4 Agents", title: "Parallel AI Multi-Agent", desc: "Multi-agent architecture evaluating distinct compliance vectors.", color: "#00c8ff" },
      { val: "100%", title: "Traceable ISO Evidence", desc: "Every score is linked to exact text quotes and PDF page numbers.", color: "#9b59ff" },
      { val: "1-Click", title: "Executive PDF Exporter", desc: "Generates publication-ready A4 executive audit reports.", color: "#ffb300" }
    ]
  },
  {
    id: 22,
    category: "Product Vision",
    title: "Future Roadmap & Strategic Scope",
    say: "Our future roadmap includes OCR for scanned PDF disclosures, multi-language support, live regulatory feeds, and industry peer benchmarking.",
    click: "Click 4 times — reveal each roadmap item.",
    pause: "Pause on Multi-Language Support to mention global ESG expansion.",
    judges: "Judges will appreciate a visionary yet practical growth strategy.",
    items: [
      { val: "OCR", title: "Scanned Document Engine", desc: "Integrating Tesseract/Vision API for scanned legacy documents.", color: "#00ffaa" },
      { val: "Global", title: "Multi-Language Support", desc: "Auditing ESG reports in German, French, Spanish & Mandarin.", color: "#00c8ff" },
      { val: "Live API", title: "Regulatory Feeds", desc: "Real-time updates as EU ESPR & FTC regulations evolve.", color: "#9b59ff" },
      { val: "Peer", title: "Enterprise Benchmarking", desc: "Comparing ESG performance across industry competitors.", color: "#ffb300" }
    ]
  },
  {
    id: 23,
    category: "Live Demonstration",
    title: "Step-by-Step Live Walkthrough Flow",
    say: "Let us demonstrate EcoLabel X live. Watch as we upload a PDF, run 4 AI agents in <1.5s, explore dashboard metrics, and download the executive audit report.",
    click: "Click 4 times as you transition to the live application demo.",
    pause: "Pause on Step 4 before switching to http://localhost:3000.",
    judges: "Judges will experience an impressive, seamless live product demonstration.",
    items: [
      { val: "Step 1", title: "Upload PDF Report", desc: "Drag PDF report into dropzone", color: "#00ffaa" },
      { val: "Step 2", title: "Instant Analysis", desc: "Backend parses PDF in <1.5s", color: "#00c8ff" },
      { val: "Step 3", title: "Dashboard Insights", desc: "Explore EcoScore & Carbon Cards", color: "#9b59ff" },
      { val: "Step 4", title: "Export Audit PDF", desc: "Download publication-ready report", color: "#ffb300" }
    ]
  },
  {
    id: 24,
    category: "Value Created",
    title: "Quantifiable Business & ESG Impact",
    say: "EcoLabel X delivers measurable ROI: 95% audit time savings, 100% page-level transparency, and zero regulatory greenwashing penalties.",
    click: "Click 4 times to reveal each impact metric.",
    pause: "Pause on 95% Audit Time Reduction to leave a lasting quantitative metric.",
    judges: "Judges will see tangible business ROI and real environmental value.",
    items: [
      { val: "95%", title: "Audit Time Reduction", desc: "Reduces ESG report analysis from weeks to 1.5 seconds.", color: "#00ffaa" },
      { val: "100%", title: "Audit Traceability", desc: "Every score is linked to exact quotes and PDF page numbers.", color: "#00c8ff" },
      { val: "$0 Fines", title: "Regulatory Protection", desc: "Prevents costly EU ESPR & FTC Green Guide non-compliance fines.", color: "#9b59ff" },
      { val: "Scope 1-3", title: "Carbon Accountability", desc: "Accelerates genuine Scope 1-3 reduction across supply chains.", color: "#ffb300" }
    ]
  },
  {
    id: 25,
    category: "Conclusion",
    title: "Thank You! — EcoLabel X Intelligence Platform",
    say: "Thank you judges for your time! We are now open for your questions.",
    click: "No further clicks needed. Leave slide open for Q&A.",
    pause: "Pause and look at the judges confidently.",
    judges: "Judges can view live app URL and GitHub repository links while asking questions.",
    items: [
      { val: "EcoLabel X", title: "Live Application Demo: http://localhost:3000", desc: "GitHub Repository: github.com/mohamedidhris777/eco-label  •  Ready for Q&A", color: "#00ffaa" }
    ]
  }
];

export default function PresentationPage() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [revealStep, setRevealStep] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const slide = SLIDES[currentSlideIndex];
  const maxSteps = slide.items.length;

  const nextStep = useCallback(() => {
    if (revealStep < maxSteps) {
      setRevealStep((prev) => prev + 1);
    } else if (currentSlideIndex < SLIDES.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
      setRevealStep(0);
    }
  }, [revealStep, maxSteps, currentSlideIndex]);

  const prevStep = useCallback(() => {
    if (revealStep > 0) {
      setRevealStep((prev) => prev - 1);
    } else if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
      setRevealStep(SLIDES[currentSlideIndex - 1].items.length);
    }
  }, [revealStep, currentSlideIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        nextStep();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prevStep();
      } else if (e.key === "n" || e.key === "N") {
        setShowNotes((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextStep, prevStep]);

  return (
    <div
      className="min-h-screen w-full bg-[#07090E] text-white flex flex-col justify-between p-6 sm:p-10 select-none relative overflow-hidden font-sans"
      onClick={nextStep}
    >
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ffaa]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00c8ff]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="flex items-center justify-between z-10">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-[#00c8ff] uppercase bg-[#00c8ff]/10 px-3 py-1 rounded-full border border-[#00c8ff]/20">
            ECOLABEL X • SLIDE {slide.id < 10 ? `0${slide.id}` : slide.id} OF 25 • {slide.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mt-3 text-white tracking-tight">
            {slide.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); setShowNotes(!showNotes); }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-all"
          >
            {showNotes ? "Hide Notes [N]" : "Speaker Notes [N]"}
          </button>
          <div className="text-xs font-mono text-slate-400">
            Click anywhere or Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white">Space</kbd> / <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white">→</kbd>
          </div>
        </div>
      </header>

      {/* Main Slide Content Area */}
      <main className="flex-1 my-8 flex items-center justify-center z-10">
        <div className="w-full max-w-6xl grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {slide.items.map((item, idx) => {
            const isRevealed = idx < revealStep || slide.id === 1 || slide.id === 25;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all duration-700 transform ${
                  isRevealed
                    ? "opacity-100 translate-y-0 scale-100 bg-[#131B2E] border-white/10 shadow-2xl shadow-[rgba(0,0,0,0.5)]"
                    : "opacity-0 translate-y-8 scale-95 pointer-events-none"
                }`}
                style={{ borderColor: isRevealed ? `${item.color}40` : "rgba(255,255,255,0.05)" }}
              >
                <div
                  className="text-4xl font-display font-bold mb-2 tracking-tight"
                  style={{ color: item.color }}
                >
                  {item.val}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Speaker Notes Overlay Drawer */}
      {showNotes && (
        <div
          className="fixed bottom-16 right-10 w-96 p-6 rounded-2xl bg-[#0F172A]/95 border border-[#00c8ff]/30 backdrop-blur-xl shadow-2xl z-50 text-xs space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-[#00c8ff] uppercase tracking-wider">🎙️ Speaker Notes (Slide {slide.id})</span>
            <button onClick={() => setShowNotes(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div>
            <strong className="text-emerald-400 block mb-1">🎤 WHAT TO SAY:</strong>
            <p className="text-slate-300 italic">{slide.say}</p>
          </div>
          <div>
            <strong className="text-cyan-400 block mb-1">🖱️ WHAT TO CLICK:</strong>
            <p className="text-slate-300">{slide.click}</p>
          </div>
          <div>
            <strong className="text-purple-400 block mb-1">⏸️ WHEN TO PAUSE:</strong>
            <p className="text-slate-300">{slide.pause}</p>
          </div>
          <div>
            <strong className="text-amber-400 block mb-1">💡 WHAT JUDGES SHOULD NOTICE:</strong>
            <p className="text-slate-300">{slide.judges}</p>
          </div>
        </div>
      )}

      {/* Footer Navigation Bar */}
      <footer className="flex items-center justify-between border-t border-white/5 pt-4 z-10 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); prevStep(); }}
            className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-white font-mono"
          >
            ← Prev Step
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextStep(); }}
            className="px-3 py-1 rounded bg-[#00ffaa]/20 border border-[#00ffaa]/30 hover:bg-[#00ffaa]/30 text-[#00ffaa] font-mono font-bold"
          >
            Next Step ({revealStep}/{maxSteps}) →
          </button>
        </div>

        <div className="flex items-center gap-1">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrentSlideIndex(i); setRevealStep(0); }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentSlideIndex ? "bg-[#00ffaa] w-6" : "bg-white/20 hover:bg-white/40"
              }`}
              title={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <div>
          <span className="font-mono text-[#00ffaa] font-semibold">EcoLabel X</span> Hackathon Presentation 2026
        </div>
      </footer>
    </div>
  );
}
