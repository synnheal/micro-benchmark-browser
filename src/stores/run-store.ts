import { create } from "zustand";
import type { RunProgress, RunStatus } from "@/types/run";

interface RunState {
  status: RunStatus;
  progress: RunProgress;
  abortController: AbortController | null;
  error: string | null;

  startRun: () => AbortController;
  updateProgress: (p: Partial<RunProgress>) => void;
  finishRun: () => void;
  cancelRun: () => void;
  setError: (msg: string) => void;
  reset: () => void;
}

const initialProgress: RunProgress = {
  currentBenchId: null,
  currentBenchName: "",
  currentRepeat: 0,
  totalRepeats: 0,
  completedBenches: 0,
  totalBenches: 0,
  phase: "idle",
};

export const useRunStore = create<RunState>((set, get) => ({
  status: "idle",
  progress: { ...initialProgress },
  abortController: null,
  error: null,

  startRun: () => {
    const ac = new AbortController();
    set({
      status: "running",
      progress: { ...initialProgress },
      abortController: ac,
      error: null,
    });
    return ac;
  },

  updateProgress: (p) => {
    set((s) => ({ progress: { ...s.progress, ...p } }));
  },

  finishRun: () => {
    set({ status: "done", abortController: null });
  },

  cancelRun: () => {
    get().abortController?.abort();
    set({
      status: "cancelled",
      abortController: null,
      progress: { ...initialProgress },
    });
  },

  setError: (msg) => {
    set({ status: "error", error: msg, abortController: null });
  },

  reset: () => {
    get().abortController?.abort();
    set({
      status: "idle",
      progress: { ...initialProgress },
      abortController: null,
      error: null,
    });
  },
}));
