import type { BenchDefinition, BenchResult } from "@/types/bench";
import type { WorkerMessage, WorkerResult } from "@/lib/worker/types";
import { computeStats, trimOutliers, stabilityLabel } from "./stats";

export interface JsRunnerCallbacks {
  onProgress: (benchId: string, repeat: number, total: number, phase: string) => void;
  onResult: (result: BenchResult) => void;
}

export async function runJsBench(
  bench: BenchDefinition,
  callbacks: JsRunnerCallbacks,
  signal?: AbortSignal
): Promise<BenchResult> {
  const allSamples: number[] = [];

  for (let r = 0; r < bench.repeats; r++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    callbacks.onProgress(bench.id, r + 1, bench.repeats, "measure");

    const result = await runWorkerIteration(bench, signal);
    allSamples.push(...result.samples);
  }

  const trimmed = trimOutliers(allSamples);
  const stats = computeStats(trimmed);

  const benchResult: BenchResult = {
    benchId: bench.id,
    stats,
    raw: allSamples,
    unit: bench.unit,
    higherIsBetter: bench.higherIsBetter,
    stability: stabilityLabel(stats.cv),
    timestamp: Date.now(),
  };

  callbacks.onResult(benchResult);
  return benchResult;
}

function runWorkerIteration(
  bench: BenchDefinition,
  signal?: AbortSignal
): Promise<WorkerResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("../worker/js-worker.ts", import.meta.url)
    );

    const cleanup = () => worker.terminate();

    if (signal) {
      signal.addEventListener("abort", () => {
        cleanup();
        reject(new DOMException("Aborted", "AbortError"));
      });
    }

    worker.onmessage = (e: MessageEvent<WorkerResult>) => {
      cleanup();
      resolve(e.data);
    };

    worker.onerror = (err) => {
      cleanup();
      reject(new Error(err.message));
    };

    const msg: WorkerMessage = {
      type: "run",
      benchId: bench.id,
      fn: bench.fn!,
      warmupMs: bench.warmupMs,
      durationMs: bench.durationMs,
    };

    worker.postMessage(msg);
  });
}

export async function runAllJsBenches(
  benches: BenchDefinition[],
  callbacks: JsRunnerCallbacks & {
    onBenchStart: (benchId: string, index: number, total: number) => void;
  },
  signal?: AbortSignal
): Promise<BenchResult[]> {
  const results: BenchResult[] = [];

  for (let i = 0; i < benches.length; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    callbacks.onBenchStart(benches[i].id, i, benches.length);
    const result = await runJsBench(benches[i], callbacks, signal);
    results.push(result);
  }

  return results;
}
