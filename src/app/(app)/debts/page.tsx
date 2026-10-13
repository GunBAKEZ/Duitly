import { getLocale, getTranslations } from "next-intl/server";
import { KpiCard } from "@/components/features/kpi-card";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatRupiah } from "@/lib/format";
import { debts } from "@/lib/mock-data";

const TODAY = new Date("2026-10-13");

export default async function DebtsPage() {
  const t = await getTranslations("debts");
  const c = await getTranslations("common");
  const locale = await getLocale();
  const rp = (n: number) => formatRupiah(n, locale);
  const sum = (dir: string) => debts.filter((d) => d.direction === dir).reduce((a, d) => a + d.principal - d.paid, 0);

  const list = (dir: "owe" | "owed") =>
    debts
      .filter((d) => d.direction === dir)
      .map((d) => {
        const remaining = d.principal - d.paid;
        const overdue = remaining > 0 && new Date(d.due) < TODAY;
        return (
          <Card key={d.id}>
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{d.who}</p>
                  <p className="text-xs text-muted-foreground">
                    {c("dueDate")}: {formatDate(d.due, locale)}
                  </p>
                </div>
                {overdue ? <Badge variant="destructive">{c("overdue")}</Badge> : null}
              </div>
              <Progress value={(d.paid / d.principal) * 100} />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("remaining")} <span className="font-medium text-foreground">{rp(remaining)}</span>
                </span>
                {dir === "owe" && <Button size="sm" variant="outline">{t("payNow")}</Button>}
              </div>
            </CardContent>
          </Card>
        );
      });

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard label={t("totalOwe")} value={rp(sum("owe"))} />
        <KpiCard label={t("totalOwed")} value={rp(sum("owed"))} />
      </div>
      <Tabs defaultValue="owe">
        <TabsList>
          <TabsTrigger value="owe">{t("owe")}</TabsTrigger>
          <TabsTrigger value="owed">{t("owed")}</TabsTrigger>
        </TabsList>
        <TabsContent value="owe" className="grid gap-4 pt-4 md:grid-cols-2 xl:grid-cols-3">{list("owe")}</TabsContent>
        <TabsContent value="owed" className="grid gap-4 pt-4 md:grid-cols-2 xl:grid-cols-3">{list("owed")}</TabsContent>
      </Tabs>
    </>
  );
}
