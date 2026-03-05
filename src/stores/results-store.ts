import { create } from "zustand";
import type { BenchResult } from "@/types/bench";
import type { SuiteResult, ScoreBreakdown } from "@/types/run";

interface ResultsState {
  currentResults: BenchResult[];
  currentScore: ScoreBreakdown | null;
  currentSuite: SuiteResult | null;

  addResult: (result: BenchResult) => void;
  setScore: (score: ScoreBreakdown) => void;
  setSuite: (suite: SuiteResult) => void;
  clearResults: () => void;
}

export const useResultsStore = create<ResultsState>((set) => ({
  currentResults: [],
  currentScore: null,
  currentSuite: null,

  addResult: (result) => {
    set((s) => ({
      currentResults: [...s.currentResults, result],
    }));
  },

  setScore: (score) => {
    set({ currentScore: score });
  },

  setSuite: (suite) => {
    set({ currentSuite: suite });
  },

  clearResults: () => {
    set({ currentResults: [], currentScore: null, currentSuite: null });
  },
}));
