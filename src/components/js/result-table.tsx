"use client";

import { useTranslations } from "next-intl";
import type { BenchResult } from "@/types/bench";
import { ALL_BENCHES } from "@/lib/engine/registry";
import { formatNumber } from "@/lib/utils/bytes";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function JsResultTable({ results }: { results: BenchResult[] }) {
  const t = useTranslations("js");

  if (results.length === 0) return null;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("benchmark")}</TableHead>
          <TableHead className="text-right">{t("median")}</TableHead>
          <TableHead className="text-right">{t("mean")}</TableHead>
          <TableHead className="text-right">{t("p95")}</TableHead>
          <TableHead className="text-right">{t("stddev")}</TableHead>
          <TableHead>{t("stability")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((r) => {
          const bench = ALL_BENCHES.find((b) => b.id === r.benchId);
          return (
            <TableRow key={r.benchId}>
              <TableCell className="font-medium">{bench?.name ?? r.benchId}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(r.stats.median)} {r.unit}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(r.stats.mean)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(r.stats.p95)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(r.stats.stddev)}
              </TableCell>
              <TableCell>
                <StabilityBadge stability={r.stability} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function StabilityBadge({ stability }: { stability: string }) {
  const t = useTranslations("common");
  const variant =
    stability === "stable"
      ? "default"
      : stability === "moderate"
        ? "secondary"
        : "destructive";

  return (
    <Badge variant={variant} className="text-xs">
      {t(stability as "stable" | "moderate" | "unstable")}
    </Badge>
  );
}
