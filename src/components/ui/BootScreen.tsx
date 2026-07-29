/**
 * EcoLabel X — System Boot Screen / Splash Screen
 *
 * Runs initial boot animation on application launch.
 * Displays system initialization stages (FastAPI, Claims Engine, Gemini AI, Global State).
 */
"use client";

import { useEffect, useState } from "react";

const BOOT_STAGES = [
  { label: "Connecting FastAPI Backend (http://localhost:8000)", pct: 20 },
  { label: "Loading Rule-Based Claim Detector & Taxonomies", pct: 45 },
  { label: "Initializing Gemini AI Verification Layer", pct: 70 },
  { label: "Mounting Global Dashboard Shell", pct: 90 },
  { label: "EcoLabel X Engine Ready", pct: 100 },
];

export function BootScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if already booted in current session
    if (typeof window !== "undefined") {
      const isBooted = sessionStorage.getItem("ecolabelx_booted");
      if (isBooted) {
        setVisible(false);
        return;
      }
    }

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      const pct = Math.min(100, current * 2.5);
      setProgress(pct);

      if (pct < 30) setStageIdx(0);
      else if (pct < 55) setStageIdx(1);
      else if (pct < 80) setStageIdx(2);
      else if (pct < 95) setStageIdx(3);
      else setStageIdx(4);

      if (pct >= 100) {
        clearInterval(interval);
        setFading(true);
        setTimeout(() => {
          setVisible(false);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("ecolabelx_booted", "true");
          }
        }, 500);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#050a18] flex flex-col items-center justify-center p-6 transition-opacity duration-500 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Glow background sphere */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#00ffaa]/10 to-[#00c8ff]/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-md">
        {/* Animated Brand Badge */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#00ffaa] to-[#00c8ff] flex items-center justify-center text-2xl font-extrabold text-[#050a18] shadow-[0_0_50px_rgba(0,255,170,0.4)] animate-pulse">
            EX
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00ffaa] border-2 border-[#050a18] animate-ping" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="font-display font-bold text-2xl text-white tracking-tight">
            EcoLabel <span className="text-[#00ffaa]">X</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">
            Intelligent Sustainability Engine
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-2">
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #00ffaa, #00c8ff, #9b59ff)",
                boxShadow: "0 0 15px rgba(0, 255, 170, 0.6)",
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400 truncate max-w-[220px]">
              {BOOT_STAGES[stageIdx]?.label}
            </span>
            <span className="text-[#00ffaa] font-semibold">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
