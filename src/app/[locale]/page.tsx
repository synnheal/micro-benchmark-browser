"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useHistoryStore } from "@/stores/history-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "@/components/shared/score-badge";
import { Play, Zap, Monitor, HardDrive, GitCompare, FileText } from "lucide-react";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tn = useTranslations("nav");
  const { runs, load } = useHistoryStore();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  useEffect(() => {
    load();
  }, [load]);

  const latestRun = runs[0] ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Latest Score */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">{t("lastScore")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-4">
            {latestRun?.score ? (
              <ScoreBadge score={latestRun.score} />
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </CardContent>
        </Card>

        {/* Run Suite */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">{t("runSuite")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <Button
              size="lg"
              onClick={() => router.push(`/${locale}/suite`)}
              className="gap-2"
            >
              <Play className="h-5 w-5" />
              {t("runSuite")}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Runs */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">{t("recentRuns")}</CardTitle>
          </CardHeader>
          <CardContent>
            {runs.length === 0 ? (
              <span className="text-sm text-muted-foreground">—</span>
            ) : (
              <div className="space-y-2">
                {runs.slice(0, 3).map((run) => (
                  <div key={run.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {new Date(run.timestamp).toLocaleDateString()}
                    </span>
                    <span className="font-medium tabular-nums">
                      {run.score?.total ?? "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">{t("quickActions")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { key: "js", icon: Zap, href: `/${locale}/js` },
            { key: "fps", icon: Monitor, href: `/${locale}/fps` },
            { key: "memory", icon: HardDrive, href: `/${locale}/memory` },
            { key: "compare", icon: GitCompare, href: `/${locale}/compare` },
            { key: "reports", icon: FileText, href: `/${locale}/reports` },
          ].map(({ key, icon: Icon, href }) => (
            <Card
              key={key}
              className="cursor-pointer transition-colors hover:bg-accent"
              onClick={() => router.push(href)}
            >
              <CardContent className="flex items-center gap-3 py-4">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{tn(key as keyof typeof tn)}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
