"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import type { BenchDefinition, BenchResult } from "@/types/bench";
import { FPS_SCENES } from "@/lib/engine/registry";
import { runFpsBench } from "@/lib/engine/fps-runner";
import { useRunStore } from "@/stores/run-store";
import { useResultsStore } from "@/stores/results-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RunControls } from "@/components/runner/run-controls";
import { FpsChart } from "./fps-chart";
import { Play } from "lucide-react";

export function FpsArena() {
  const t = useTranslations("fps");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedScene, setSelectedScene] = useState<BenchDefinition>(FPS_SCENES[0]);
  const [frameTimes, setFrameTimes] = useState<{ time: number; fps: number }[]>([]);
  const [result, setResult] = useState<BenchResult | null>(null);
  const { status, startRun, finishRun, setError, updateProgress } = useRunStore();
  const { addResult } = useResultsStore();

  const handleRun = useCallback(async () => {
    if (!canvasRef.current) return;

    setFrameTimes([]);
    setResult(null);
    const ac = startRun();

    updateProgress({
      currentBenchId: selectedScene.id,
      currentBenchName: selectedScene.name,
      totalBenches: 1,
      phase: "warmup",
    });

    try {
      const res = await runFpsBench(
        selectedScene,
        canvasRef.current,
        {
          onFrame: (_ft, fps, elapsed) => {
            setFrameTimes((prev) => {
              const next = [...prev, { time: elapsed, fps }];
              return next.length > 600 ? next.slice(-600) : next;
            });
          },
          onResult: (r) => {
            setResult(r);
            addResult(r);
          },
        },
        ac.signal
      );
      setResult(res);
      finishRun();
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(String(e));
    }
  }, [selectedScene, startRun, finishRun, setError, updateProgress, addResult]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FPS_SCENES.map((scene) => (
          <Button
            key={scene.id}
            variant={selectedScene.id === scene.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedScene(scene)}
            disabled={status === "running"}
          >
            {scene.name}
          </Button>
        ))}
        <div className="ml-auto">
          <RunControls onRun={handleRun} disabled={status === "running"} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("scene")}</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              className="h-64 w-full rounded border bg-black"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("frameTime")}</CardTitle>
          </CardHeader>
          <CardContent>
            <FpsChart data={frameTimes} />
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card>
          <CardContent className="flex items-center gap-6 py-4">
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums">
                {result.stats.median.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">{t("avgFps")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums">
                {result.stats.p5.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">{t("onePercentLow")}</div>
            </div>
            <Badge variant="outline">{result.stability}</Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
