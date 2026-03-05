"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = pathname.split("/")[1] || "en";
  const newLocale = currentLocale === "en" ? "fr" : "en";

  const handleToggle = () => {
    const rest = pathname.split("/").slice(2).join("/");
    router.push(`/${newLocale}/${rest}`);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="gap-1.5 text-xs font-medium"
      aria-label={`Switch to ${newLocale}`}
    >
      <Languages className="h-4 w-4" />
      {newLocale.toUpperCase()}
    </Button>
  );
}
