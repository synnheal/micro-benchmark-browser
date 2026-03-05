import type { SuiteResult } from "@/types/run";
import type { DeltaResult, CompareReport } from "@/types/compare";
import { ALL_BENCHES } from "./registry";

const SAME_THRESHOLD = 0.02; // 2%

export function compareRuns(base: SuiteResult, current: SuiteResult): CompareReport {
  const deltas: DeltaResult[] = [];

  for (const curResult of current.results) {
    const baseResult = base.results.find((r) => r.benchId === curResult.benchId);
    if (!baseResult) continue;

    const bench = ALL_BENCHES.find((b) => b.id === curResult.benchId);
    const baseVal = baseResult.stats.median;
    const curVal = curResult.stats.median;
    const deltaPercent = baseVal !== 0 ? ((curVal - baseVal) / baseVal) * 100 : 0;

    let direction: "better" | "worse" | "same";
    if (Math.abs(deltaPercent) < SAME_THRESHOLD * 100) {
      direction = "same";
    } else if (curResult.higherIsBetter) {
      direction = deltaPercent > 0 ? "better" : "worse";
    } else {
      direction = deltaPercent < 0 ? "better" : "worse";
    }

    deltas.push({
      benchId: curResult.benchId,
      benchName: bench?.name ?? curResult.benchId,
      unit: curResult.unit,
      higherIsBetter: curResult.higherIsBetter,
      baseValue: baseVal,
      currentValue: curVal,
      deltaPercent: Math.round(deltaPercent * 100) / 100,
      direction,
      baseStat: baseResult,
      currentStat: curResult,
    });
  }

  const overallDelta =
    deltas.length > 0
      ? deltas.reduce((sum, d) => sum + d.deltaPercent, 0) / deltas.length
      : 0;

  return {
    baseRunId: base.id,
    currentRunId: current.id,
    baseTimestamp: base.timestamp,
    currentTimestamp: current.timestamp,
    deltas,
    overallDelta: Math.round(overallDelta * 100) / 100,
  };
}
