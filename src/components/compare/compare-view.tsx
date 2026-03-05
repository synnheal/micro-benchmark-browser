"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useHistoryStore } from "@/stores/history-store";
import { compareRuns } from "@/lib/engine/compare";
import type { CompareReport } from "@/types/compare";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber, formatMs } from "@/lib/utils/bytes";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

export function CompareView() {
  const t = useTranslations("compare");
  const { runs, load } = useHistoryStore();
  const [baseId, setBaseId] = useState<string>("");
  const [currentId, setCurrentId] = useState<string>("");

  useEffect(() => {
    load();
  }, [load]);

  const report: CompareReport | null = useMemo(() => {
    const base = runs.find((r) => r.id === baseId);
    const current = runs.find((r) => r.id === currentId);
    if (!base || !current) return null;
    return compareRuns(base, current);
  }, [runs, baseId, currentId]);

  if (runs.length < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t("noRuns")}
        </CardContent>
      </Card>
    );
  }

  const formatRunLabel = (run: { id: string; timestamp: number; label?: string }) => {
    const date = new Date(run.timestamp).toLocaleString();
    return run.label ? `${run.label} (${date})` : date;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">{t("baseline")}</label>
          <Select value={baseId} onValueChange={setBaseId}>
            <SelectTrigger>
              <SelectValue placeholder={t("selectRun")} />
            </SelectTrigger>
            <SelectContent>
              {runs.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {formatRunLabel(r)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t("current")}</label>
          <Select value={currentId} onValueChange={setCurrentId}>
            <SelectTrigger>
              <SelectValue placeholder={t("selectRun")} />
            </SelectTrigger>
            <SelectContent>
              {runs.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {formatRunLabel(r)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {report && (
        <>
          <Card>
            <CardContent className="flex items-center justify-center gap-2 py-4">
              <span className="text-sm text-muted-foreground">{t("overallDelta")}:</span>
              <span
                className={`text-2xl font-bold tabular-nums ${
                  report.overallDelta > 0
                    ? "text-green-500"
                    : report.overallDelta < 0
                      ? "text-red-500"
                      : "text-muted-foreground"
                }`}
              >
                {report.overallDelta > 0 ? "+" : ""}
                {report.overallDelta.toFixed(2)}%
              </span>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Benchmark</TableHead>
                <TableHead className="text-right">{t("baseline")}</TableHead>
                <TableHead className="text-right">{t("current")}</TableHead>
                <TableHead className="text-right">{t("delta")}</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.deltas.map((d) => {
                const fmt = d.unit === "ms" ? formatMs : formatNumber;
                return (
                  <TableRow key={d.benchId}>
                    <TableCell className="font-medium">{d.benchName}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fmt(d.baseValue)} {d.unit}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fmt(d.currentValue)} {d.unit}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span
                        className={
                          d.direction === "better"
                            ? "text-green-500"
                            : d.direction === "worse"
                              ? "text-red-500"
                              : "text-muted-foreground"
                        }
                      >
                        {d.deltaPercent > 0 ? "+" : ""}
                        {d.deltaPercent.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <DirBadge direction={d.direction} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}

function DirBadge({ direction }: { direction: "better" | "worse" | "same" }) {
  const t = useTranslations("compare");
  if (direction === "better")
    return (
      <Badge className="gap-1 bg-green-500/10 text-green-500">
        <ArrowUp className="h-3 w-3" />
        {t("better")}
      </Badge>
    );
  if (direction === "worse")
    return (
      <Badge className="gap-1 bg-red-500/10 text-red-500">
        <ArrowDown className="h-3 w-3" />
        {t("worse")}
      </Badge>
    );
  return (
    <Badge variant="outline" className="gap-1">
      <Minus className="h-3 w-3" />
      {t("same")}
    </Badge>
  );
}
