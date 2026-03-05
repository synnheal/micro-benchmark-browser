export interface WorkerMessage {
  type: "run";
  benchId: string;
  fn: string;
  warmupMs: number;
  durationMs: number;
}

export interface WorkerResult {
  benchId: string;
  samples: number[];
  totalOps: number;
  elapsedMs: number;
}
