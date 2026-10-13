import { getLocale, getTranslations } from "next-intl/server";
import { CashflowChart } from "@/components/features/cashflow-chart";
import { KpiCard } from "@/components/features/kpi-card";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatDate, formatRupiah } from "@/lib/format";
import { budget, cashflow, costCategories, debts, goals, kpis, transactions } from "@/lib/mock-data";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const c = await getTranslations("common");
  const locale = await getLocale();
  const rp = (n: number) => formatRupiah(n, locale);
  const dueSoon = debts.filter((d) => d.direction === "owe" && d.principal > d.paid).slice(0, 3);

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label={t("totalBalance")} value={rp(kpis.balance)} />
        <KpiCard label={t("monthIncome")} value={rp(kpis.income)} delta={kpis.incomeDelta} hint={t("vsLastMonth")} />
        <KpiCard label={t("monthExpense")} value={rp(kpis.expense)} delta={kpis.expenseDelta} hint={t("vsLastMonth")} />
        <KpiCard label={t("activeDebt")} value={rp(kpis.debt)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("cashflow")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CashflowChart data={cashflow} labels={{ income: c("income"), expense: c("expense") }} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("budget")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-2xl font-semibold">{rp(budget.used)}</p>
              <Progress value={(budget.used / budget.limit) * 100} />
              <p className="text-xs text-muted-foreground">
                {t("budgetUsed")} {rp(budget.limit)}
              </p>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>{t("dueSoon")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dueSoon.length === 0 && <p className="text-sm text-muted-foreground">{t("nothingDue")}</p>}
              {dueSoon.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{d.who}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(d.due, locale)}</p>
                  </div>
                  <span>{rp(d.installment)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("costAnalysis")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {costCategories.map((k) => (
              <div key={k.key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{k.key}</span>
                  <span className="text-muted-foreground">{k.value}%</span>
                </div>
                <Progress value={k.value} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("goals")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {goals.map((g) => (
              <div key={g.name} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{g.name}</span>
                  <span className="text-muted-foreground">
                    {rp(g.saved)} / {rp(g.target)}
                  </span>
                </div>
                <Progress value={(g.saved / g.target) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("recent")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {transactions.slice(0, 5).map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.name}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(tx.date, locale)}</TableCell>
                  <TableCell>
                    <Badge variant={tx.status === "completed" ? "secondary" : "outline"}>{c(tx.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
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
