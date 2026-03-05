"use client";

import type { ScoreBreakdown } from "@/types/run";
import { cn } from "@/lib/utils";

export function ScoreBadge({ score }: { score: ScoreBreakdown | null | undefined }) {
  if (!score) return null;

  const color =
    score.total >= 80
      ? "text-green-500"
      : score.total >= 50
        ? "text-yellow-500"
        : "text-red-500";

  return (
    <div className="flex flex-col items-center">
      <span className={cn("text-4xl font-bold tabular-nums", color)}>
        {score.total}
      </span>
      <span className="text-xs text-muted-foreground">/ 100</span>
    </div>
  );
}
