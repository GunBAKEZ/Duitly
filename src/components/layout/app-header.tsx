"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { SidebarTrigger } from "@/components/ui/sidebar";

const titles: Record<string, string> = {
  "/": "dashboard",
  "/transactions": "transactions",
  "/debts": "debts",
  "/spending": "spending",
  "/wishlist": "wishlist",
  "/savings": "savings",
  "/settings": "settings",
};

export function AppHeader({ children }: { children?: React.ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const ns = titles["/" + (pathname.split("/")[1] ?? "")] ?? "dashboard";

  return (
    <header className="flex h-16 items-center gap-3 border-b bg-card px-4 md:px-6">
      <SidebarTrigger />
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold leading-tight tracking-tight">{t(`${ns}.title`)}</h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">{t(`${ns}.subtitle`)}</p>
      </div>
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </header>
  );
}
