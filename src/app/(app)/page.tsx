import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatDate, formatRupiah } from "@/lib/format";
import { budget, costCategories, debts, goals, kpis, transactions } from "@/lib/mock-data";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const c = await getTranslations("common");
  const locale = await getLocale();
  const rp = (n: number) => formatRupiah(n, locale);
  const dueSoon = debts.filter((d) => d.direction === "owe" && d.principal > d.paid).slice(0, 3);
  const budgetPct = Math.round((budget.used / budget.limit) * 100);
  const sortedCosts = [...costCategories].sort((a, b) => b.value - a.value);

  return (
    <>
      <SectionCards
        items={[
          { label: t("totalBalance"), value: rp(kpis.balance), footer: t("fBalance"), hint: t("fBalanceSub") },
          { label: t("monthIncome"), value: rp(kpis.income), delta: kpis.incomeDelta, footer: t("fIncome"), hint: t("fIncomeSub") },
          { label: t("monthExpense"), value: rp(kpis.expense), delta: kpis.expenseDelta, footer: t("fExpense"), hint: t("fExpenseSub") },
          { label: t("activeDebt"), value: rp(kpis.debt), footer: t("fDebt"), hint: t("fDebtSub", { n: dueSoon.length }) },
        ]}
      />

      <ChartAreaInteractive />

      <div className="grid gap-4 @3xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("budget")}</CardTitle>
            <CardDescription>
              {t("budgetUsed")} {rp(budget.limit)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold tabular-nums">{rp(budget.used)}</p>
            <Progress value={budgetPct} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("percentUsed", { n: budgetPct })}</span>
              <span>{t("leftAmount", { amount: rp(budget.limit - budget.used) })}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("goals")}</CardTitle>
            <CardAction>
              <Link href="/savings" className={buttonVariants({ variant: "outline", size: "sm" })}>
                {t("add")}
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.map((g) => (
              <div key={g.name} className="space-y-1.5">
                <div className="flex justify-between gap-2 text-sm">
                  <span className="font-medium">{g.name}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {rp(g.saved)} / {rp(g.target)}
                  </span>
                </div>
                <Progress value={(g.saved / g.target) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dueSoon")}</CardTitle>
          </CardHeader>
          <CardContent>
            {dueSoon.length === 0 && <p className="text-sm text-muted-foreground">{t("nothingDue")}</p>}
            <Table>
              <TableBody>
                {dueSoon.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.who}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(d.due, locale)}</TableCell>
                    <TableCell className="text-right tabular-nums">{rp(d.installment)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("costAnalysis")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-x-6 gap-y-3 @md/main:grid-cols-2">
            {sortedCosts.map((k) => (
              <div key={k.key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{k.key}</span>
                  <span className="text-muted-foreground tabular-nums">{k.value}%</span>
                </div>
                <Progress value={k.value} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("recent")}</CardTitle>
          <CardDescription>{t("recentSub")}</CardDescription>
          <CardAction>
            <Link href="/transactions" className={buttonVariants({ variant: "outline", size: "sm" })}>
              {t("viewAll")}
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {transactions.slice(0, 5).map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.name}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(tx.date, locale)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{c(tx.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {tx.type === "income" ? "+" : "−"}
                    {rp(tx.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
