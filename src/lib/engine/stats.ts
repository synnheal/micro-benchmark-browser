import type { BenchStats } from "@/types/bench";

export function computeStats(samples: number[]): BenchStats {
  if (samples.length === 0) {
    return { mean: 0, median: 0, stddev: 0, p5: 0, p95: 0, min: 0, max: 0, samples: 0, cv: 0 };
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
  const variance = sorted.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
  const stddev = Math.sqrt(variance);
  const p5 = percentile(sorted, 5);
  const p95 = percentile(sorted, 95);

  return {
    mean,
    median,
    stddev,
    p5,
    p95,
    min: sorted[0],
    max: sorted[n - 1],
    samples: n,
    cv: mean !== 0 ? stddev / mean : 0,
  };
}

function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

/** Remove outliers beyond 2 * IQR */
export function trimOutliers(samples: number[]): number[] {
  if (samples.length < 4) return samples;
  const sorted = [...samples].sort((a, b) => a - b);
  const q1 = percentile(sorted, 25);
  const q3 = percentile(sorted, 75);
  const iqr = q3 - q1;
  const lo = q1 - 2 * iqr;
  const hi = q3 + 2 * iqr;
  return sorted.filter((v) => v >= lo && v <= hi);
}

export function stabilityLabel(cv: number): "stable" | "moderate" | "unstable" {
  if (cv < 0.05) return "stable";
  if (cv < 0.15) return "moderate";
  return "unstable";
}
