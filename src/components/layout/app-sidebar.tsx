"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeftRight, Gauge, Gift, HandCoins, LayoutDashboard, PiggyBank, Settings, Wallet } from "lucide-react";
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
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

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
          <SidebarGroupLabel className="text-[11px] tracking-wider uppercase">{t("menu")}</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(items)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{renderItems(more)}</SidebarFooter>
    </Sidebar>
  );
}
