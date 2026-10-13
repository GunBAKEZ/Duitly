import { ArrowDown, ArrowUp, ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { CashflowChart } from "@/components/features/cashflow-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatDate, formatRupiah } from "@/lib/format";
import { budget, cashflow, costCategories, debts, goals, kpis, transactions } from "@/lib/mock-data";

function Delta({ value }: { value: number }) {
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        up ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700",
      )}
    >
      <Icon className="size-3" />
      {Math.abs(value)}%
    </span>
  );
}

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const c = await getTranslations("common");
  const locale = await getLocale();
  const rp = (n: number) => formatRupiah(n, locale);
  const dueSoon = debts.filter((d) => d.direction === "owe" && d.principal > d.paid).slice(0, 3);
  const budgetPct = Math.round((budget.used / budget.limit) * 100);
  const sortedCosts = [...costCategories].sort((a, b) => b.value - a.value);

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* Kolom kiri */}
      <div className="flex min-w-0 flex-col gap-4">
        <Card className="gap-0 bg-gradient-to-br from-primary/15 via-card to-card py-0">
          <div className="flex flex-wrap items-start justify-between gap-3 p-5">
            <div className="space-y-2">
              <Badge className="bg-primary/25 text-[10px] font-semibold tracking-wider text-primary-foreground uppercase">
                {t("overview")}
              </Badge>
              <p className="text-[11px] tracking-wider text-muted-foreground uppercase">{t("totalBalanceCaps")}</p>
              <p className="text-4xl font-bold tracking-tight">{rp(kpis.balance)}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card/80 px-3 py-1 text-xs text-muted-foreground ring-1 ring-foreground/10">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {t("realtime")}
            </span>
          </div>
          <div className="grid grid-cols-1 border-t sm:grid-cols-3 sm:divide-x">
            <div className="space-y-1.5 p-4">
              <p className="text-xs text-muted-foreground">{t("monthIncome")}</p>
              <p className="text-lg font-semibold">{rp(kpis.income)}</p>
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Delta value={kpis.incomeDelta} /> {t("vsLastMonth")}
              </p>
            </div>
            <div className="space-y-1.5 border-t p-4 sm:border-t-0">
              <p className="text-xs text-muted-foreground">{t("monthExpense")}</p>
              <p className="text-lg font-semibold">{rp(kpis.expense)}</p>
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Delta value={kpis.expenseDelta} /> {t("vsLastMonth")}
              </p>
            </div>
            <div className="space-y-1.5 border-t p-4 sm:border-t-0">
              <p className="text-xs text-muted-foreground">{t("activeDebt")}</p>
              <p className="text-lg font-semibold">{rp(kpis.debt)}</p>
              <p className="text-[11px] text-orange-600">{t("billsRegistered", { n: dueSoon.length })}</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("cashflow")}</CardTitle>
            <CardDescription className="text-xs">{t("cashflowSub")}</CardDescription>
            <CardAction className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm" style={{ background: "var(--chart-3)" }} />
                {c("expense")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm" style={{ background: "var(--chart-1)" }} />
                {c("income")}
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <CashflowChart data={cashflow} labels={{ income: c("income"), expense: c("expense") }} />
          </CardContent>
        </Card>

        <Card className="gap-0 pb-0">
          <CardHeader className="pb-3">
            <CardTitle>{t("recent")}</CardTitle>
            <CardDescription className="text-xs">{t("recentSub")}</CardDescription>
            <CardAction>
              <Link href="/transactions" className="text-xs font-medium text-emerald-700 hover:underline">
                {t("viewAll")}
              </Link>
            </CardAction>
          </CardHeader>
          <ul className="divide-y border-t">
            {transactions.slice(0, 5).map((tx) => {
              const income = tx.type === "income";
              const Icon = income ? ArrowDown : ArrowUp;
              return (
                <li key={tx.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full",
                      income ? "bg-primary/30 text-emerald-800" : "bg-orange-100 text-orange-600",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{tx.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.date, locale)}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn("hidden sm:inline-flex", tx.status === "pending" && "bg-amber-100 text-amber-700")}
                  >
                    {c(tx.status)}
                  </Badge>
                  <span className={cn("w-32 text-right text-sm font-semibold", income && "text-emerald-600")}>
                    {income ? "+" : "−"}
                    {rp(tx.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* Kolom kanan */}
      <div className="flex min-w-0 flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("budget")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-bold">{rp(budget.used)}</p>
            <p className="text-xs text-muted-foreground">
              {t("budgetUsed")} {rp(budget.limit)}
            </p>
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
              <Link href="/savings" className="text-xs font-medium text-emerald-700 hover:underline">
                + {t("add")}
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-3">
            {goals.map((g) => (
              <div key={g.name} className="space-y-1">
                <div className="flex justify-between gap-2 text-xs">
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

        <Card>
          <CardHeader>
            <CardTitle>{t("dueSoon")}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {dueSoon.length === 0 && <p className="text-sm text-muted-foreground">{t("nothingDue")}</p>}
            {dueSoon.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2.5 text-sm first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium">{d.who}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(d.due, locale)}</p>
                </div>
                <span className="font-semibold">{rp(d.installment)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("costAnalysis")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {sortedCosts.map((k) => (
              <div key={k.key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{k.key}</span>
                  <span className="text-muted-foreground">{k.value}%</span>
                </div>
                <Progress value={k.value} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
