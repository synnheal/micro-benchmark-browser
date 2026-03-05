export type BenchCategory = "js" | "fps" | "memory";

export interface BenchDefinition {
  id: string;
  name: string;
  category: BenchCategory;
  description: string;
  /** warmup duration in ms */
  warmupMs: number;
  /** measurement window in ms */
  durationMs: number;
  /** number of repeats */
  repeats: number;
  /** higher is better? */
  higherIsBetter: boolean;
  /** unit of measure */
  unit: string;
  /** function body (for JS benches) — serialized string */
  fn?: string;
  /** FPS scene config */
  scene?: FpsScene;
}

export interface FpsScene {
  type: "rects" | "particles" | "sprites";
  objectCount: number;
}

export interface BenchSample {
  value: number;
  timestamp: number;
}

export interface BenchStats {
  mean: number;
  median: number;
  stddev: number;
  p5: number;
  p95: number;
  min: number;
  max: number;
  samples: number;
  /** coefficient of variation (stddev / mean) */
  cv: number;
}

export interface BenchResult {
  benchId: string;
  stats: BenchStats;
  raw: number[];
  unit: string;
  higherIsBetter: boolean;
  /** stability: "stable" | "moderate" | "unstable" based on cv */
  stability: "stable" | "moderate" | "unstable";
  timestamp: number;
}
