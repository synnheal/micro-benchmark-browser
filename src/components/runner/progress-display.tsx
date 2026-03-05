"use client";

import { useRunStore } from "@/stores/run-store";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function ProgressDisplay() {
  const { status, progress } = useRunStore();

  if (status !== "running") return null;

  const percent =
    progress.totalBenches > 0
      ? ((progress.completedBenches + (progress.currentRepeat / Math.max(progress.totalRepeats, 1))) /
          progress.totalBenches) *
        100
      : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {progress.currentBenchName || "Starting..."}
        </span>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {progress.phase}
          </Badge>
          <span className="tabular-nums">
            {progress.completedBenches}/{progress.totalBenches}
          </span>
        </div>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  );
}
