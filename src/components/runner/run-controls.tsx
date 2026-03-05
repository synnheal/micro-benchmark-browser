"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRunStore } from "@/stores/run-store";
import { Play, Square } from "lucide-react";

interface RunControlsProps {
  onRun: () => void;
  disabled?: boolean;
}

export function RunControls({ onRun, disabled }: RunControlsProps) {
  const t = useTranslations("common");
  const { status, cancelRun } = useRunStore();
  const isRunning = status === "running";

  return (
    <div className="flex items-center gap-2">
      {isRunning ? (
        <Button variant="destructive" onClick={cancelRun} size="sm">
          <Square className="mr-1.5 h-4 w-4" />
          {t("cancel")}
        </Button>
      ) : (
        <Button onClick={onRun} disabled={disabled} size="sm">
          <Play className="mr-1.5 h-4 w-4" />
          {t("run")}
        </Button>
      )}
    </div>
  );
}
