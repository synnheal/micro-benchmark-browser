import type { BenchResult } from "./bench";

export interface DeltaResult {
  benchId: string;
  benchName: string;
  unit: string;
  higherIsBetter: boolean;
  baseValue: number;
  currentValue: number;
  deltaPercent: number;
  /** "better" | "worse" | "same" */
  direction: "better" | "worse" | "same";
  baseStat: BenchResult;
  currentStat: BenchResult;
}

export interface CompareReport {
  baseRunId: string;
  currentRunId: string;
  baseTimestamp: number;
  currentTimestamp: number;
  deltas: DeltaResult[];
  overallDelta: number;
}
