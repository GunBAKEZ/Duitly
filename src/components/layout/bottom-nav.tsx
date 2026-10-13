"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeftRight, Gauge, Gift, HandCoins, LayoutDashboard, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", key: "dashboard", icon: LayoutDashboard },
  { href: "/transactions", key: "transactions", icon: ArrowLeftRight },
  { href: "/debts", key: "debts", icon: HandCoins },
  { href: "/spending", key: "spendingShort", icon: Gauge },
  { href: "/wishlist", key: "wishlist", icon: Gift },
  { href: "/savings", key: "savings", icon: PiggyBank },
] as const;

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-6">
        {items.map(({ href, key, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-muted-foreground",
                active(href) && "text-foreground",
              )}
            >
              <span className={cn("rounded-full px-3 py-1", active(href) && "bg-primary text-primary-foreground")}>
                <Icon className="size-4" />
              </span>
              <span className="max-w-full truncate px-0.5">{t(key)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
