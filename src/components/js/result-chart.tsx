"use client";

import type { BenchResult } from "@/types/bench";
import { ALL_BENCHES } from "@/lib/engine/registry";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ErrorBar,
} from "recharts";

export function JsResultChart({ results }: { results: BenchResult[] }) {
  if (results.length === 0) return null;

  const data = results.map((r) => {
    const bench = ALL_BENCHES.find((b) => b.id === r.benchId);
    return {
      name: bench?.name ?? r.benchId,
      median: Math.round(r.stats.median),
      error: Math.round(r.stats.stddev),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="name"
          angle={-35}
          textAnchor="end"
          height={80}
          className="text-xs fill-muted-foreground"
        />
        <YAxis className="text-xs fill-muted-foreground" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="median" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]}>
          <ErrorBar dataKey="error" stroke="hsl(var(--muted-foreground))" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
