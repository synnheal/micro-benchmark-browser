import type { SuiteResult } from "@/types/run";

const STORAGE_KEY = "micro-bench-runs";
const MAX_RUNS = 50;

export function loadRuns(): SuiteResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SuiteResult[];
  } catch {
    return [];
  }
}

export function saveRun(run: SuiteResult): void {
  const runs = loadRuns();
  runs.unshift(run);
  if (runs.length > MAX_RUNS) runs.length = MAX_RUNS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
}

export function deleteRun(runId: string): void {
  const runs = loadRuns().filter((r) => r.id !== runId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
}

export function clearRuns(): void {
  localStorage.removeItem(STORAGE_KEY);
}

const BASELINE_KEY = "micro-bench-baseline";

export function getBaselineId(): string | null {
  return localStorage.getItem(BASELINE_KEY);
}

export function setBaselineId(runId: string): void {
  localStorage.setItem(BASELINE_KEY, runId);
}
