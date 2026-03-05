"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { JS_BENCHES } from "@/lib/engine/registry";
import { runAllJsBenches } from "@/lib/engine/js-runner";
import { useRunStore } from "@/stores/run-store";
import { useResultsStore } from "@/stores/results-store";
import type { BenchResult } from "@/types/bench";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RunControls } from "@/components/runner/run-controls";
import { ProgressDisplay } from "@/components/runner/progress-display";
import { JsResultTable } from "@/components/js/result-table";
import { JsResultChart } from "@/components/js/result-chart";

export default function JsPage() {
  const t = useTranslations("js");
  const [results, setResults] = useState<BenchResult[]>([]);
  const { status, startRun, finishRun, setError, updateProgress } = useRunStore();
  const { addResult } = useResultsStore();

  const handleRun = useCallback(async () => {
    setResults([]);
    const ac = startRun();

    updateProgress({ totalBenches: JS_BENCHES.length, completedBenches: 0 });

    try {
      const res = await runAllJsBenches(
        JS_BENCHES,
        {
          onBenchStart: (benchId, index, total) => {
            const bench = JS_BENCHES.find((b) => b.id === benchId);
            updateProgress({
              currentBenchId: benchId,
              currentBenchName: bench?.name ?? benchId,
              completedBenches: index,
              totalBenches: total,
              phase: "warmup",
            });
          },
          onProgress: (_benchId, repeat, total, phase) => {
            updateProgress({
              currentRepeat: repeat,
              totalRepeats: total,
              phase: phase as "warmup" | "measure",
            });
          },
          onResult: (r) => {
            addResult(r);
            setResults((prev) => [...prev, r]);
          },
        },
        ac.signal
      );

      finishRun();
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(String(e));
    }
  }, [startRun, finishRun, setError, updateProgress, addResult]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <RunControls onRun={handleRun} disabled={status === "running"} />
      </div>

      <ProgressDisplay />

      {results.length > 0 && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Results</CardTitle>
            </CardHeader>
            <CardContent>
              <JsResultChart results={results} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <JsResultTable results={results} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
