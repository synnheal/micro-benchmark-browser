import type { BenchResult, BenchCategory } from "@/types/bench";
import type { ScoreBreakdown, SuiteResult } from "@/types/run";

const WEIGHTS: Record<BenchCategory, number> = {
  js: 0.5,
  fps: 0.35,
  memory: 0.15,
};

/** Reference values for normalization (approximate "good" device) */
const REFERENCE: Record<string, number> = {
  "json-parse-small": 2_000_000,
  "json-stringify-medium": 50_000,
  "array-map-filter": 5_000,
  "array-reduce": 100_000,
  "object-property-access": 500_000,
  "string-template": 100_000,
  "regex-match": 20_000,
  "fps-rects-1000": 60,
  "fps-rects-5000": 30,
  "fps-particles-2000": 45,
  "mem-alloc-32mb": 5,
  "mem-alloc-64mb": 10,
};

export function computeScore(
  results: BenchResult[],
  baseline?: SuiteResult
): ScoreBreakdown {
  const byCategory: Record<BenchCategory, { normalized: number; count: number; cvSum: number }> = {
    js: { normalized: 0, count: 0, cvSum: 0 },
    fps: { normalized: 0, count: 0, cvSum: 0 },
    memory: { normalized: 0, count: 0, cvSum: 0 },
  };

  for (const result of results) {
    const category = getCategoryFromId(result.benchId);
    if (!category) continue;

    const ref = getReference(result.benchId, baseline);
    let norm: number;

    if (result.higherIsBetter) {
      norm = ref > 0 ? result.stats.median / ref : 1;
    } else {
      norm = result.stats.median > 0 ? ref / result.stats.median : 1;
    }

    norm = Math.max(0, Math.min(2, norm));
    byCategory[category].normalized += norm;
    byCategory[category].count += 1;
    byCategory[category].cvSum += result.stats.cv;
  }

  const categories = {} as Record<BenchCategory, { score: number; weight: number }>;
  let totalScore = 0;
  let totalCv = 0;
  let totalCount = 0;

  for (const cat of ["js", "fps", "memory"] as BenchCategory[]) {
    const { normalized, count, cvSum } = byCategory[cat];
    const avgNorm = count > 0 ? normalized / count : 0;
    const catScore = avgNorm * 100;
    categories[cat] = { score: Math.round(catScore), weight: WEIGHTS[cat] };
    totalScore += catScore * WEIGHTS[cat];
    totalCv += cvSum;
    totalCount += count;
  }

  const avgCv = totalCount > 0 ? totalCv / totalCount : 0;
  const confidence: "high" | "medium" | "low" =
    avgCv < 0.05 ? "high" : avgCv < 0.15 ? "medium" : "low";

  return {
    total: Math.round(totalScore),
    categories,
    confidence,
  };
}

function getCategoryFromId(id: string): BenchCategory | null {
  if (id.startsWith("fps-")) return "fps";
  if (id.startsWith("mem-")) return "memory";
  return "js";
}

function getReference(benchId: string, baseline?: SuiteResult): number {
  if (baseline) {
    const baseResult = baseline.results.find((r) => r.benchId === benchId);
    if (baseResult) return baseResult.stats.median;
  }
  return REFERENCE[benchId] ?? 1;
}
