import type { BenchResult, BenchCategory } from "./bench";

export type RunStatus = "idle" | "running" | "done" | "cancelled" | "error";

export interface RunProgress {
  currentBenchId: string | null;
  currentBenchName: string;
  currentRepeat: number;
  totalRepeats: number;
  completedBenches: number;
  totalBenches: number;
  phase: "warmup" | "measure" | "cooldown" | "idle";
}

export interface SuiteResult {
  id: string;
  timestamp: number;
  results: BenchResult[];
  systemInfo: SystemInfo;
  score?: ScoreBreakdown;
  label?: string;
}

export interface ScoreBreakdown {
  total: number;
  categories: Record<BenchCategory, { score: number; weight: number }>;
  confidence: "high" | "medium" | "low";
}

export interface SystemInfo {
  userAgent: string;
  cores: number;
  memory?: number;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  language: string;
  platform: string;
}
