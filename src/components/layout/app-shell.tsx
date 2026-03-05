"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageToggle } from "@/components/shared/language-toggle";
import {
  Gauge,
  Zap,
  Monitor,
  HardDrive,
  GitCompare,
  FileText,
  Play,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", href: "", icon: Gauge },
  { key: "suite", href: "/suite", icon: Play },
  { key: "js", href: "/js", icon: Zap },
  { key: "fps", href: "/fps", icon: Monitor },
  { key: "memory", href: "/memory", icon: HardDrive },
  { key: "compare", href: "/compare", icon: GitCompare },
  { key: "reports", href: "/reports", icon: FileText },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  // Extract locale from pathname
  const locale = pathname.split("/")[1] || "en";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
          <Link href={`/${locale}`} className="mr-6 flex items-center gap-2 font-bold">
            <Gauge className="h-5 w-5" />
            <span className="hidden sm:inline">MicroBench</span>
          </Link>

          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
              const fullHref = `/${locale}${href}`;
              const isActive =
                href === ""
                  ? pathname === `/${locale}` || pathname === `/${locale}/`
                  : pathname.startsWith(fullHref);

              return (
                <Link
                  key={key}
                  href={fullHref}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{t(key)}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
