"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useHistoryStore } from "@/stores/history-store";
import { formatJsonReport } from "@/lib/report/format-json";
import { formatMdReport } from "@/lib/report/format-md";
import { downloadJson, downloadMarkdown, copyToClipboard } from "@/lib/utils/download";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/shared/score-badge";
import {
  FileJson,
  FileText,
  Copy,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export function ReportList() {
  const t = useTranslations("reports");
  const { runs, baselineId, load, removeRun, setBaseline } = useHistoryStore();

  useEffect(() => {
    load();
  }, [load]);

  if (runs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t("noRuns")}
        </CardContent>
      </Card>
    );
  }

  const handleExportJson = (runIndex: number) => {
    const run = runs[runIndex];
    const data = formatJsonReport(run);
    downloadJson(data, `bench-${run.id.slice(0, 8)}.json`);
  };

  const handleExportMd = (runIndex: number) => {
    const run = runs[runIndex];
    const md = formatMdReport(run);
    downloadMarkdown(md, `bench-${run.id.slice(0, 8)}.md`);
  };

  const handleCopy = async (runIndex: number) => {
    const run = runs[runIndex];
    const md = formatMdReport(run);
    const ok = await copyToClipboard(md);
    if (ok) toast.success(t("copyReport"));
  };

  return (
    <div className="space-y-3">
      {runs.map((run, i) => (
        <Card key={run.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                {run.label || new Date(run.timestamp).toLocaleString()}
              </CardTitle>
              <div className="flex items-center gap-1">
                {run.id === baselineId && (
                  <Badge variant="default" className="text-xs">
                    {t("isBaseline")}
                  </Badge>
                )}
                <ScoreBadge score={run.score} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{run.results.length} benchmarks</span>
              <span>&middot;</span>
              <span>{run.systemInfo.cores} cores</span>
              <span>&middot;</span>
              <span>
                {run.systemInfo.screenWidth}x{run.systemInfo.screenHeight}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportJson(i)}
                className="gap-1"
              >
                <FileJson className="h-3.5 w-3.5" />
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportMd(i)}
                className="gap-1"
              >
                <FileText className="h-3.5 w-3.5" />
                MD
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(i)}
                className="gap-1"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              {run.id !== baselineId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBaseline(run.id)}
                  className="gap-1"
                >
                  <Star className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeRun(run.id)}
                className="gap-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
