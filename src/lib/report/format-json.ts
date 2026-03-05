import type { SuiteResult } from "@/types/run";

export function formatJsonReport(run: SuiteResult) {
  return {
    id: run.id,
    timestamp: new Date(run.timestamp).toISOString(),
    score: run.score,
    systemInfo: run.systemInfo,
    results: run.results.map((r) => ({
      benchId: r.benchId,
      unit: r.unit,
      median: r.stats.median,
      mean: r.stats.mean,
      p95: r.stats.p95,
      stddev: r.stats.stddev,
      stability: r.stability,
      samples: r.stats.samples,
    })),
  };
}
