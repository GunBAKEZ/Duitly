import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createWishAction, deleteWishAction, startSavingAction } from "@/actions/finance";
import { ActionDialog } from "@/components/action-dialog";
import { DeleteButton } from "@/components/delete-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getDb } from "@/db";
import { getUser } from "@/lib/auth";
import { isConfigured } from "@/lib/env";
import { formatRupiah } from "@/lib/format";
import { kpis as mockKpis, wishlist as mockWishlist } from "@/lib/mock-data";
import { getMonthSummary, listWishlist } from "@/lib/queries";

type Wish = { id: string; name: string; price: number; priority: "low" | "medium" | "high"; status: string };

export default async function WishlistPage() {
  const t = await getTranslations("wishlist");
  const locale = await getLocale();
  const demo = !isConfigured;

  let items: Wish[];
  let balance: number;
  if (demo) {
    items = mockWishlist.map((w) => ({ id: String(w.id), name: w.name, price: w.price, priority: w.priority, status: "wanted" }));
    balance = mockKpis.balance;
  } else {
    const user = await getUser();
    if (!user) redirect("/login");
    const db = getDb();
    const [list, summary] = await Promise.all([listWishlist(db, user.id), getMonthSummary(db, user.id, new Date())]);
    items = list;
    balance = summary.balance;
  }
  const total = items.filter((w) => w.status !== "bought").reduce((a, w) => a + w.price, 0);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {t("total")}: <span className="font-semibold text-foreground">{formatRupiah(total, locale)}</span>
        </p>
        <ActionDialog
          trigger={t("add")}
          triggerVariant="default"
          title={t("add")}
          submitLabel={t("add")}
          successMessage={t("saved")}
          action={createWishAction}
          demo={demo}
          fields={[
            { name: "name", label: t("name"), type: "text", required: true },
            { name: "price", label: t("price"), type: "number", required: true },
            {
              name: "priority",
              label: t("priority"),
              type: "select",
              defaultValue: "medium",
              options: [
                { value: "high", label: t("high") },
                { value: "medium", label: t("medium") },
                { value: "low", label: t("low") },
              ],
            },
          ]}
        />
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((w) => (
            <Card key={w.id}>
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{w.name}</p>
                  <Badge variant={w.priority === "high" ? "default" : "secondary"}>{t(w.priority)}</Badge>
                </div>
                <p className="text-xl font-semibold tabular-nums">{formatRupiah(w.price, locale)}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {w.status === "saving" ? t("saving") : w.price <= balance ? t("affordable") : t("saveFirst")}
                  </span>
                  <div className="flex items-center gap-1">
                    {w.status === "wanted" && (
                      <ActionDialog
                        trigger={t("startSaving")}
                        title={t("startTitle")}
                        description={w.name}
                        submitLabel={t("startSaving")}
                        successMessage={t("started")}
                        action={startSavingAction}
                        demo={demo}
                        hidden={{ id: w.id }}
                        fields={[{ name: "months", label: t("months"), type: "number", required: true, defaultValue: "6" }]}
                      />
                    )}
                    <DeleteButton id={w.id} action={deleteWishAction} demo={demo} successMessage={t("deleted")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
