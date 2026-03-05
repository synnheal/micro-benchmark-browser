"use client";

import { useTranslations } from "next-intl";
import { CompareView } from "@/components/compare/compare-view";

export default function ComparePage() {
  const t = useTranslations("compare");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <CompareView />
    </div>
  );
}
