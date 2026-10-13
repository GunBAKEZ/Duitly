import { getLocale, getTranslations } from "next-intl/server";
import { SavingsCalculator } from "@/components/features/savings-calculator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatRupiah } from "@/lib/format";
import { goals } from "@/lib/mock-data";
import { computeSavingsPlan, isOnTrack } from "@/lib/services/savings-plan";

export default async function SavingsPage() {
  const t = await getTranslations("savings");
  const locale = await getLocale();
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {goals.map((g) => {
          const plan = computeSavingsPlan({ targetAmount: g.target, saved: g.saved, months: g.monthsLeft });
          const total = g.monthsLeft + 3;
          const ok = isOnTrack(g.saved, g.target, 3, total);
          return (
            <Card key={g.name}>
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between">
                  <p className="font-medium">{g.name}</p>
                  <Badge variant={ok ? "success" : "destructive"}>{ok ? t("onTrack") : t("behind")}</Badge>
                </div>
                <Progress value={(g.saved / g.target) * 100} />
                <p className="text-sm text-muted-foreground">
                  {formatRupiah(g.saved, locale)} / {formatRupiah(g.target, locale)} · {t("timeLeft", { n: g.monthsLeft })}
                </p>
                <p className="text-sm">
                  {formatRupiah(plan.perMonth, locale)} / {formatRupiah(plan.perDay, locale)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <SavingsCalculator />
    </>
  );
}
