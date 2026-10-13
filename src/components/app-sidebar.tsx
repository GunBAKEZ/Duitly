"use client"

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  ArrowLeftRightIcon,
  GaugeIcon,
  GiftIcon,
  HandCoinsIcon,
  LayoutDashboardIcon,
  PiggyBankIcon,
  Settings2Icon,
  WalletIcon,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("nav")

  const navMain = [
    { title: t("dashboard"), url: "/", icon: <LayoutDashboardIcon /> },
    { title: t("transactions"), url: "/transactions", icon: <ArrowLeftRightIcon /> },
    { title: t("debts"), url: "/debts", icon: <HandCoinsIcon /> },
    { title: t("spending"), url: "/spending", icon: <GaugeIcon /> },
    { title: t("wishlist"), url: "/wishlist", icon: <GiftIcon /> },
    { title: t("savings"), url: "/savings", icon: <PiggyBankIcon /> },
  ]
  const navSecondary = [{ title: t("settings"), url: "/settings", icon: <Settings2Icon /> }]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/" />}
            >
              <WalletIcon className="size-5!" />
              <span className="text-base font-semibold">Duitly</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} quickCreateLabel={t("quickCreate")} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{ name: t("guest"), email: "belum login" }}
          labels={{ account: t("account"), logout: t("logout") }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
