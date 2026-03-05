"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { MEMORY_BENCHES } from "@/lib/engine/registry";
import { runMemoryBench, isMemoryApiAvailable, getMemoryInfo } from "@/lib/engine/memory-runner";
import { useRunStore } from "@/stores/run-store";
import { useResultsStore } from "@/stores/results-store";
import type { BenchResult } from "@/types/bench";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RunControls } from "@/components/runner/run-controls";
import { ProgressDisplay } from "@/components/runner/progress-display";
import { formatBytes, formatMs } from "@/lib/utils/bytes";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export function MemoryPanel() {
  const t = useTranslations("memory");
  const [results, setResults] = useState<BenchResult[]>([]);
  const { status, startRun, finishRun, setError, updateProgress } = useRunStore();
  const { addResult } = useResultsStore();
  const memApi = typeof window !== "undefined" ? isMemoryApiAvailable() : false;
  const memInfo = typeof window !== "undefined" ? getMemoryInfo() : null;

  const handleRun = useCallback(async () => {
    setResults([]);
    const ac = startRun();

    updateProgress({
      totalBenches: MEMORY_BENCHES.length,
      completedBenches: 0,
    });

    try {
      const allResults: BenchResult[] = [];

      for (let i = 0; i < MEMORY_BENCHES.length; i++) {
        if (ac.signal.aborted) break;

        const bench = MEMORY_BENCHES[i];
        updateProgress({
          currentBenchId: bench.id,
          currentBenchName: bench.name,
          completedBenches: i,
          phase: "measure",
        });

        const res = await runMemoryBench(
          bench,
          {
            onProgress: (_id, repeat, total) => {
              updateProgress({ currentRepeat: repeat, totalRepeats: total });
            },
            onResult: (r) => {
              addResult(r);
              allResults.push(r);
            },
          },
          ac.signal
        );
      }

      setResults(allResults);
      finishRun();
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(String(e));
    }
  }, [startRun, finishRun, setError, updateProgress, addResult]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={memApi ? "default" : "secondary"} className="gap-1">
            {memApi ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {t("apiStatus")}: {memApi ? t("supported") : t("notSupported")}
          </Badge>
        </div>
        <RunControls onRun={handleRun} disabled={status === "running"} />
      </div>

      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="flex items-start gap-2 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
          <p className="text-sm text-muted-foreground">{t("disclaimer")}</p>
        </CardContent>
      </Card>

      {memInfo && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Performance.memory</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-bold">{formatBytes(memInfo.usedJSHeapSize)}</div>
              <div className="text-xs text-muted-foreground">{t("heapUsed")}</div>
            </div>
            <div>
              <div className="text-lg font-bold">{formatBytes(memInfo.totalJSHeapSize)}</div>
              <div className="text-xs text-muted-foreground">{t("heapTotal")}</div>
            </div>
          </CardContent>
        </Card>
      )}

      <ProgressDisplay />

      {results.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("allocTime")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map((r) => {
              const bench = MEMORY_BENCHES.find((b) => b.id === r.benchId);
              return (
                <div key={r.benchId} className="flex items-center justify-between">
                  <span className="text-sm">{bench?.name ?? r.benchId}</span>
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums text-sm font-medium">
                      {formatMs(r.stats.median)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {r.stability}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
