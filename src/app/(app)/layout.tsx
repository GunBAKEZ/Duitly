import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { QuickAddProvider } from "@/components/quick-add";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getDb } from "@/db";
import { getUser } from "@/lib/auth";
import { isConfigured } from "@/lib/env";
import { ensureDefaults, listAccounts, listCategories } from "@/lib/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (isConfigured && !user) redirect("/login");

  let accounts: { id: string; name: string }[] = [];
  let categories: { id: string; name: string; kind: "income" | "expense" }[] = [];
  if (user) {
    const db = getDb();
    await ensureDefaults(db, user.id);
    const [accs, cats] = await Promise.all([listAccounts(db, user.id), listCategories(db, user.id)]);
    accounts = accs;
    categories = cats.flatMap((c) => (c.kind === "transfer" ? [] : [{ id: c.id, name: c.name, kind: c.kind }]));
  }

  return (
    <QuickAddProvider accounts={accounts} categories={categories}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" user={user} />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">{children}</div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </QuickAddProvider>
  );
}
