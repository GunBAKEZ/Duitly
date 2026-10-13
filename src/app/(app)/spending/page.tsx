import { getLocale, getTranslations } from "next-intl/server";
import { ScoreGauge } from "@/components/features/score-gauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { computeSpendingScore } from "@/lib/services/spending-score";
import { kpis, needWantSaving } from "@/lib/mock-data";

export default async function SpendingPage() {
  const t = await getTranslations("spending");
  await getLocale();
  const { score, level } = computeSpendingScore({
    income: kpis.income,
    expense: kpis.expense,
    wantExpense: kpis.income * (needWantSaving.want / 100),
    budget: 10000000,
    avgExpenseLast3Months: 6000000,
  });
  const ideal = { need: 50, want: 30, saving: 20 };

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("score")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreGauge score={score} label={t(level)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("rule")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(["need", "want", "saving"] as const).map((k) => (
              <div key={k} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{t(k)}</span>
                  <span className="text-muted-foreground">
                    {t("actual")} {needWantSaving[k]}% · {t("ideal")} {ideal[k]}%
                  </span>
                </div>
                <Progress value={needWantSaving[k]} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("insights")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>{t("insight1")}</li>
            <li>{t("insight2")}</li>
            <li>{t("insight3")}</li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
