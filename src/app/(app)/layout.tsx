import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("common");
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 px-4 md:px-6">
          <SidebarTrigger />
          <div className="ml-auto flex items-center gap-2">
            <LocaleSwitcher />
            <Button size="sm">
              <Plus /> {t("addTransaction")}
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:p-6 md:pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
