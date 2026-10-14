import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ScoreGauge } from "@/components/features/score-gauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDb } from "@/db";
import { getUser } from "@/lib/auth";
import { isConfigured } from "@/lib/env";
import { kpis as mockKpis, needWantSaving as mockNws } from "@/lib/mock-data";
import { getExpenseByCategory, getMonthSummary } from "@/lib/queries";
import { computeSpendingScore } from "@/lib/services/spending-score";

export default async function SpendingPage() {
  const t = await getTranslations("spending");
  const ideal = { need: 50, want: 30, saving: 20 };

  let income = mockKpis.income;
  let expense = mockKpis.expense;
  let nws: { need: number; want: number; saving: number } = mockNws;
  let wantExpense = income * (nws.want / 100);
  let budget: number | undefined = 10_000_000;
  let avg3: number | undefined = 6_000_000;
  let insights = [t("insight1"), t("insight2"), t("insight3")];

  if (isConfigured) {
    const user = await getUser();
    if (!user) redirect("/login");
    const db = getDb();
    const now = new Date();
    const [summary, costs] = await Promise.all([getMonthSummary(db, user.id, now), getExpenseByCategory(db, user.id, now)]);
    income = summary.income;
    expense = summary.expense;
    const sumNature = (n: string) => costs.filter((c) => c.nature === n).reduce((a, c) => a + c.amount, 0);
    wantExpense = sumNature("want");
    const share = (v: number) => (income > 0 ? Math.round((v / income) * 100) : 0);
    const need = share(sumNature("need"));
    const want = share(wantExpense);
    nws = { need, want, saving: Math.max(0, 100 - need - want) };
    budget = undefined;
    avg3 = undefined;
    insights = [];
    if (income > 0) insights.push(want > ideal.want ? t("insightWantHigh", { n: want }) : t("insightWantOk", { n: want }));
    if (costs[0]) insights.push(t("insightTop", { name: costs[0].key, n: costs[0].value }));
    if (income > 0) insights.push(t("insightSaving", { n: nws.saving }));
  }

  if (isConfigured && income === 0 && expense === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">{t("noData")}</CardContent>
      </Card>
    );
  }

  const { score, level } = computeSpendingScore({ income, expense, wantExpense, budget, avgExpenseLast3Months: avg3 });

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
                    {t("actual")} {nws[k]}% · {t("ideal")} {ideal[k]}%
                  </span>
                </div>
                <Progress value={nws[k]} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("insights")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {insights.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}
