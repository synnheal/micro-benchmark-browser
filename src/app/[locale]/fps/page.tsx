"use client";

import { useTranslations } from "next-intl";
import { FpsArena } from "@/components/fps/fps-arena";

export default function FpsPage() {
  const t = useTranslations("fps");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <FpsArena />
    </div>
  );
}
