import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("common");
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader>
          <LocaleSwitcher />
          <Button size="sm">
            <Plus /> {t("addTransaction")}
          </Button>
        </AppHeader>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
