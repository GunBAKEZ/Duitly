import { getLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { wishlist } from "@/lib/mock-data";

const WANT_BUDGET_LEFT = 3000000;

export default async function WishlistPage() {
  const t = await getTranslations("wishlist");
  const locale = await getLocale();
  const total = wishlist.reduce((a, w) => a + w.price, 0);
  return (
    <>
      <PageHeader title={t("title")} subtitle={`${t("subtitle")} · ${t("total")}: ${formatRupiah(total, locale)}`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {wishlist.map((w) => (
          <Card key={w.id}>
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{w.name}</p>
                <Badge variant={w.priority === "high" ? "default" : "secondary"}>{t(w.priority)}</Badge>
              </div>
              <p className="text-xl font-semibold">{formatRupiah(w.price, locale)}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {w.price <= WANT_BUDGET_LEFT ? t("affordable") : t("saveFirst")}
                </span>
                <Button size="sm" variant="outline">{t("startSaving")}</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
