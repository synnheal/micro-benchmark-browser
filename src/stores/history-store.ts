import { create } from "zustand";
import type { SuiteResult } from "@/types/run";
import { loadRuns, saveRun, deleteRun, getBaselineId, setBaselineId } from "@/lib/utils/storage";

interface HistoryState {
  runs: SuiteResult[];
  baselineId: string | null;

  load: () => void;
  addRun: (run: SuiteResult) => void;
  removeRun: (id: string) => void;
  setBaseline: (id: string) => void;
  getBaseline: () => SuiteResult | undefined;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  runs: [],
  baselineId: null,

  load: () => {
    set({
      runs: loadRuns(),
      baselineId: getBaselineId(),
    });
  },

  addRun: (run) => {
    saveRun(run);
    set((s) => ({ runs: [run, ...s.runs] }));
  },

  removeRun: (id) => {
    deleteRun(id);
    set((s) => ({ runs: s.runs.filter((r) => r.id !== id) }));
  },

  setBaseline: (id) => {
    setBaselineId(id);
    set({ baselineId: id });
  },

  getBaseline: () => {
    const { runs, baselineId } = get();
    return runs.find((r) => r.id === baselineId);
  },
}));
