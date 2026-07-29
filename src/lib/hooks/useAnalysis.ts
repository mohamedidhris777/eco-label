/**
 * EcoLabel X — useAnalysis Hook
 *
 * Encapsulates the shared upload → fake-progress → fetch → result
 * state machine used by Claims, Verify, Greenwashing, Results and Audit pages.
 *
 * Usage:
 *   const { state, progress, errorMsg, run, reset } = useAnalysis(detectClaims);
 *   // state: "idle" | "uploading" | "done" | "error"
 */
"use client";

import { useCallback, useRef, useState } from "react";

export type AnalysisState = "idle" | "uploading" | "done" | "error";

export interface UseAnalysisReturn<T> {
  state:     AnalysisState;
  progress:  number;
  errorMsg:  string;
  result:    T | null;
  run:       (file: File) => Promise<void>;
  reset:     () => void;
}

/**
 * @param apiFn    Async function that accepts a File and returns the result
 * @param onSuccess Optional callback called with the result on success
 */
export function useAnalysis<T>(
  apiFn: (file: File) => Promise<T>,
  onSuccess?: (result: T) => void,
): UseAnalysisReturn<T> {
  const [state,    setState]    = useState<AnalysisState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [result,   setResult]   = useState<T | null>(null);
  const tickerRef              = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTicker = () => {
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
  };

  const run = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Only PDF files are supported.");
      setState("error");
      return;
    }

    setState("uploading");
    setProgress(0);
    setErrorMsg("");
    setResult(null);

    let fake = 0;
    tickerRef.current = setInterval(() => {
      fake = Math.min(fake + Math.random() * 8, 88);
      setProgress(fake);
    }, 250);

    try {
      const data = await apiFn(file);
      stopTicker();
      setProgress(100);
      setResult(data);
      setState("done");
      onSuccess?.(data);
    } catch (err: unknown) {
      stopTicker();
      setErrorMsg(err instanceof Error ? err.message : "Unknown error. Check console.");
      setState("error");
    }
  }, [apiFn, onSuccess]);

  const reset = useCallback(() => {
    stopTicker();
    setState("idle");
    setProgress(0);
    setErrorMsg("");
    setResult(null);
  }, []);

  return { state, progress, errorMsg, result, run, reset };
}
