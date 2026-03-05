"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { v4 as uuidv4 } from "uuid";
import { JS_BENCHES, FPS_SCENES, MEMORY_BENCHES } from "@/lib/engine/registry";
import { runAllJsBenches } from "@/lib/engine/js-runner";
import { runFpsBench } from "@/lib/engine/fps-runner";
import { runMemoryBench } from "@/lib/engine/memory-runner";
import { computeScore } from "@/lib/engine/score";
import { collectSystemInfo } from "@/lib/report/system-info";
import { useRunStore } from "@/stores/run-store";
import { useResultsStore } from "@/stores/results-store";
import { useHistoryStore } from "@/stores/history-store";
import type { BenchResult } from "@/types/bench";
import type { SuiteResult } from "@/types/run";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScoreBadge } from "@/components/shared/score-badge";
import { JsResultTable } from "@/components/js/result-table";
import { Play, Square, CheckCircle2 } from "lucide-react";

type Phase = "idle" | "js" | "fps" | "memory" | "done";

export default function SuitePage() {
  const t = useTranslations("suite");
  const tc = useTranslations("common");
  const { status, startRun, finishRun, cancelRun, setError, updateProgress } = useRunStore();
  const { addResult, clearResults } = useResultsStore();
  const { addRun, getBaseline } = useHistoryStore();

  const [phase, setPhase] = useState<Phase>("idle");
  const [allResults, setAllResults] = useState<BenchResult[]>([]);
  const [suiteResult, setSuiteResult] = useState<SuiteResult | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const totalBenches = JS_BENCHES.length + FPS_SCENES.length + MEMORY_BENCHES.length;

  const handleRun = useCallback(async () => {
    setAllResults([]);
    setSuiteResult(null);
    clearResults();
    const ac = startRun();
    const results: BenchResult[] = [];
    let completed = 0;

    try {
      // Phase 1: JS Benchmarks
      setPhase("js");
      updateProgress({
        totalBenches,
        completedBenches: 0,
        phase: "measure",
      });

      const jsResults = await runAllJsBenches(
        JS_BENCHES,
        {
          onBenchStart: (benchId, index) => {
            const bench = JS_BENCHES.find((b) => b.id === benchId);
            updateProgress({
              currentBenchId: benchId,
              currentBenchName: bench?.name ?? benchId,
              completedBenches: completed + index,
            });
          },
          onProgress: (_id, repeat, total, ph) => {
            updateProgress({
              currentRepeat: repeat,
              totalRepeats: total,
              phase: ph as "warmup" | "measure",
            });
          },
          onResult: (r) => {
            addResult(r);
            results.push(r);
            setAllResults((prev) => [...prev, r]);
          },
        },
        ac.signal
      );
      completed += JS_BENCHES.length;

      // Phase 2: FPS Benchmarks
      setPhase("fps");
      for (const scene of FPS_SCENES) {
        if (ac.signal.aborted) throw new DOMException("Aborted", "AbortError");

        updateProgress({
          currentBenchId: scene.id,
          currentBenchName: scene.name,
          completedBenches: completed,
          phase: "warmup",
        });

        // Ensure canvas is ready
        if (canvasRef.current) {
          canvasRef.current.width = canvasRef.current.offsetWidth || 640;
          canvasRef.current.height = canvasRef.current.offsetHeight || 320;

          const res = await runFpsBench(
            scene,
            canvasRef.current,
            {
              onFrame: () => {},
              onResult: (r) => {
                addResult(r);
                results.push(r);
                setAllResults((prev) => [...prev, r]);
              },
            },
            ac.signal
          );
        }
        completed++;
        updateProgress({ completedBenches: completed });
      }

      // Phase 3: Memory Benchmarks
      setPhase("memory");
      for (const bench of MEMORY_BENCHES) {
        if (ac.signal.aborted) throw new DOMException("Aborted", "AbortError");

        updateProgress({
          currentBenchId: bench.id,
          currentBenchName: bench.name,
          completedBenches: completed,
          phase: "measure",
        });

        await runMemoryBench(
          bench,
          {
            onProgress: (_id, repeat, total) => {
              updateProgress({ currentRepeat: repeat, totalRepeats: total });
            },
            onResult: (r) => {
              addResult(r);
              results.push(r);
              setAllResults((prev) => [...prev, r]);
            },
          },
          ac.signal
        );
        completed++;
        updateProgress({ completedBenches: completed });
      }

      // Compute score & save
      const baseline = getBaseline();
      const score = computeScore(results, baseline);
      const sysInfo = collectSystemInfo();

      const suite: SuiteResult = {
        id: uuidv4(),
        timestamp: Date.now(),
        results,
        systemInfo: sysInfo,
        score,
      };

      setSuiteResult(suite);
      addRun(suite);
      setPhase("done");
      finishRun();
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setPhase("idle");
        return;
      }
      setError(String(e));
      setPhase("idle");
    }
  }, [
    startRun, finishRun, setError, updateProgress, addResult,
    clearResults, addRun, getBaseline, totalBenches,
  ]);

  const progressPercent =
    status === "running"
      ? (allResults.length / totalBenches) * 100
      : phase === "done"
        ? 100
        : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex gap-2">
          {status === "running" ? (
            <Button variant="destructive" onClick={cancelRun} size="sm">
              <Square className="mr-1.5 h-4 w-4" />
              {tc("cancel")}
            </Button>
          ) : (
            <Button onClick={handleRun} size="sm">
              <Play className="mr-1.5 h-4 w-4" />
              {tc("runAll")}
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      {status === "running" && (
        <Card>
          <CardContent className="space-y-3 py-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Badge variant={phase === "js" ? "default" : "outline"}>{t("jsBenches")}</Badge>
                <Badge variant={phase === "fps" ? "default" : "outline"}>{t("fpsBenches")}</Badge>
                <Badge variant={phase === "memory" ? "default" : "outline"}>{t("memBenches")}</Badge>
              </div>
              <span className="tabular-nums text-muted-foreground">
                {allResults.length}/{totalBenches}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Hidden canvas for FPS tests */}
      <canvas
        ref={canvasRef}
        className={`h-64 w-full rounded border bg-black ${phase === "fps" ? "block" : "hidden"}`}
      />

      {/* Done */}
      {phase === "done" && suiteResult && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="flex items-center gap-4 py-4">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <div className="flex-1">
              <div className="font-medium">{t("complete")}</div>
              <div className="text-sm text-muted-foreground">
                {allResults.length} benchmarks completed
              </div>
            </div>
            <ScoreBadge score={suiteResult.score} />
          </CardContent>
        </Card>
      )}

      {/* Results table */}
      {allResults.filter((r) => r.unit === "ops/s").length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("jsBenches")}</CardTitle>
          </CardHeader>
          <CardContent>
            <JsResultTable results={allResults.filter((r) => r.unit === "ops/s")} />
          </CardContent>
        </Card>
      )}

      {allResults.filter((r) => r.unit === "fps").length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("fpsBenches")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allResults
              .filter((r) => r.unit === "fps")
              .map((r) => (
                <div key={r.benchId} className="flex items-center justify-between text-sm">
                  <span>{r.benchId}</span>
                  <span className="tabular-nums font-medium">
                    {r.stats.median.toFixed(1)} fps
                  </span>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {allResults.filter((r) => r.unit === "ms").length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("memBenches")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allResults
              .filter((r) => r.unit === "ms")
              .map((r) => (
                <div key={r.benchId} className="flex items-center justify-between text-sm">
                  <span>{r.benchId}</span>
                  <span className="tabular-nums font-medium">
                    {r.stats.median.toFixed(2)} ms
                  </span>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
