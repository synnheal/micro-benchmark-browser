"use client";

import { useTranslations } from "next-intl";
import { ReportList } from "@/components/report/report-list";

export default function ReportsPage() {
  const t = useTranslations("reports");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <ReportList />
    </div>
  );
}
