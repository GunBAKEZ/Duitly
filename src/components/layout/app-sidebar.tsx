"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeftRight, Gauge, Gift, HandCoins, LayoutDashboard, PiggyBank, Settings, Wallet } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { formatRupiah } from "@/lib/format";
import { budget } from "@/lib/mock-data";

const items = [
  { href: "/", key: "dashboard", icon: LayoutDashboard },
  { href: "/transactions", key: "transactions", icon: ArrowLeftRight },
  { href: "/debts", key: "debts", icon: HandCoins },
  { href: "/spending", key: "spending", icon: Gauge },
  { href: "/wishlist", key: "wishlist", icon: Gift },
  { href: "/savings", key: "savings", icon: PiggyBank },
] as const;

const more = [{ href: "/settings", key: "settings", icon: Settings }] as const;

export function AppSidebar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const left = budget.limit - budget.used;

  const renderItems = (list: readonly { href: string; key: string; icon: typeof Settings }[]) => (
    <SidebarMenu>
      {list.map(({ href, key, icon: Icon }) => (
        <SidebarMenuItem key={href}>
          <SidebarMenuButton isActive={active(href)} tooltip={t(key as "dashboard")} render={<Link href={href} />}>
            <Icon />
            <span>{t(key as "dashboard")}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="size-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">Duitly</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("menu")}</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(items)}</SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t("more")}</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(more)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-3">
        <div className="space-y-2 rounded-xl bg-muted p-3 group-data-[collapsible=icon]:hidden">
          <p className="text-xs text-muted-foreground">{t("budgetLeft")}</p>
          <p className="text-lg font-semibold">{formatRupiah(left, locale)}</p>
          <Progress value={(budget.used / budget.limit) * 100} />
        </div>
        <div className="flex items-center gap-2 px-1">
          <Avatar className="size-8">
            <AvatarFallback>D</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">{t("you")}</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
