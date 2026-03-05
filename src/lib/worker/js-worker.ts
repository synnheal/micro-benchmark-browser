/// <reference lib="webworker" />

import type { WorkerMessage, WorkerResult } from "./types";

/*
 * Security note: new Function() is used intentionally here.
 * Benchmark functions come from our own registry (registry.ts), NOT user input.
 * This worker runs in a sandboxed Web Worker context.
 */

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { benchId, fn, warmupMs, durationMs } = e.data;

  try {
    // Create the benchmark function from registry-defined code
    // eslint-disable-next-line no-new-func
    const factory = new Function(fn);
    const benchFn = factory();

    // Warmup phase
    const warmupEnd = performance.now() + warmupMs;
    while (performance.now() < warmupEnd) {
      benchFn();
    }

    // Measurement phase: collect ops/s samples in ~50ms windows
    const samples: number[] = [];
    const measureStart = performance.now();
    let totalOps = 0;

    while (performance.now() - measureStart < durationMs) {
      const windowStart = performance.now();
      let ops = 0;
      const windowEnd = windowStart + 50;

      while (performance.now() < windowEnd) {
        benchFn();
        ops++;
      }

      const windowElapsed = performance.now() - windowStart;
      const opsPerSec = (ops / windowElapsed) * 1000;
      samples.push(opsPerSec);
      totalOps += ops;
    }

    const elapsedMs = performance.now() - measureStart;

    const result: WorkerResult = {
      benchId,
      samples,
      totalOps,
      elapsedMs,
    };

    self.postMessage(result);
  } catch (err) {
    self.postMessage({
      benchId,
      samples: [],
      totalOps: 0,
      elapsedMs: 0,
      error: String(err),
    });
  }
};
