"use client";

import { useTranslations } from "next-intl";
import { MemoryPanel } from "@/components/memory/memory-panel";

export default function MemoryPage() {
  const t = useTranslations("memory");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <MemoryPanel />
    </div>
  );
}
