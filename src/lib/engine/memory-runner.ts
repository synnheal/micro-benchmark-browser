import type { BenchDefinition, BenchResult } from "@/types/bench";
import { computeStats, stabilityLabel } from "./stats";

interface MemoryAPI {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

export function isMemoryApiAvailable(): boolean {
  return !!(performance as unknown as { memory?: MemoryAPI }).memory;
}

export function getMemoryInfo(): MemoryAPI | null {
  const mem = (performance as unknown as { memory?: MemoryAPI }).memory;
  return mem ?? null;
}

export interface MemoryRunnerCallbacks {
  onProgress: (benchId: string, repeat: number, total: number) => void;
  onResult: (result: BenchResult) => void;
}

export async function runMemoryBench(
  bench: BenchDefinition,
  callbacks: MemoryRunnerCallbacks,
  signal?: AbortSignal
): Promise<BenchResult> {
  const sizeBytes = bench.id.includes("64mb") ? 64 * 1024 * 1024 : 32 * 1024 * 1024;
  const elemCount = sizeBytes / 8; // Float64Array = 8 bytes per element
  const allocationTimes: number[] = [];

  for (let r = 0; r < bench.repeats; r++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    callbacks.onProgress(bench.id, r + 1, bench.repeats);

    // Wait a bit for GC between repeats
    await sleep(200);

    const t0 = performance.now();
    const arr = new Float64Array(elemCount);
    // Touch memory to force allocation
    for (let i = 0; i < arr.length; i += 4096) {
      arr[i] = i;
    }
    const t1 = performance.now();
    allocationTimes.push(t1 - t0);

    // Release
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = arr;
  }

  const stats = computeStats(allocationTimes);
  const result: BenchResult = {
    benchId: bench.id,
    stats,
    raw: allocationTimes,
    unit: bench.unit,
    higherIsBetter: bench.higherIsBetter,
    stability: stabilityLabel(stats.cv),
    timestamp: Date.now(),
  };

  callbacks.onResult(result);
  return result;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
