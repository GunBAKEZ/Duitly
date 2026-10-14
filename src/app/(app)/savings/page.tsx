import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { addContributionAction, createGoalAction, deleteGoalAction } from "@/actions/finance";
import { ActionDialog } from "@/components/action-dialog";
import { DeleteButton } from "@/components/delete-button";
import { SavingsCalculator } from "@/components/features/savings-calculator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDb } from "@/db";
import { getUser } from "@/lib/auth";
import { isConfigured } from "@/lib/env";
import { formatRupiah } from "@/lib/format";
import { goals as mockGoals, REFERENCE_DATE } from "@/lib/mock-data";
import { listGoals } from "@/lib/queries";
import { computeSavingsPlan, isOnTrack } from "@/lib/services/savings-plan";

type Goal = { id: string; name: string; saved: number; target: number; startDate: string; targetDate: string };

const monthsBetween = (from: string, to: string) =>
  Math.max(0, (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24 * 30.4375));

export default async function SavingsPage() {
  const t = await getTranslations("savings");
  const locale = await getLocale();
  const demo = !isConfigured;
  const today = demo ? REFERENCE_DATE : new Date().toISOString().slice(0, 10);

  let goals: Goal[];
  if (demo) {
    goals = mockGoals.map((g, i) => {
      const start = new Date(REFERENCE_DATE);
      start.setMonth(start.getMonth() - 3);
      const end = new Date(REFERENCE_DATE);
      end.setMonth(end.getMonth() + g.monthsLeft);
      return { id: String(i), name: g.name, saved: g.saved, target: g.target, startDate: start.toISOString().slice(0, 10), targetDate: end.toISOString().slice(0, 10) };
    });
  } else {
    const user = await getUser();
    if (!user) redirect("/login");
    goals = await listGoals(getDb(), user.id);
  }

  return (
    <>
      <div className="flex justify-end">
        <ActionDialog
          trigger={t("add")}
          triggerVariant="default"
          title={t("add")}
          submitLabel={t("add")}
          successMessage={t("saved")}
          action={createGoalAction}
          demo={demo}
          fields={[
            { name: "name", label: t("goalName"), type: "text", required: true },
            { name: "targetAmount", label: t("targetAmount"), type: "number", required: true },
            { name: "targetDate", label: t("targetDate"), type: "date", required: true },
          ]}
        />
      </div>

      {goals.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((g) => {
            const monthsLeft = Math.max(1, Math.ceil(monthsBetween(today, g.targetDate)));
            const total = monthsBetween(g.startDate, g.targetDate);
            const elapsed = monthsBetween(g.startDate, today);
            const plan = computeSavingsPlan({ targetAmount: g.target, saved: g.saved, months: monthsLeft });
            const ok = isOnTrack(g.saved, g.target, elapsed, total);
            return (
              <Card key={g.id}>
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{g.name}</p>
                    <Badge variant={ok ? "outline" : "destructive"}>{ok ? t("onTrack") : t("behind")}</Badge>
                  </div>
                  <Progress value={Math.min(100, (g.saved / g.target) * 100)} />
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {formatRupiah(g.saved, locale)} / {formatRupiah(g.target, locale)} · {t("timeLeft", { n: monthsLeft })}
                  </p>
                  <p className="text-sm tabular-nums">
                    {formatRupiah(plan.perMonth, locale)} {t("perMonth")} · {formatRupiah(plan.perDay, locale)} {t("perDay")}
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    <ActionDialog
                      trigger={t("deposit")}
                      title={t("depositTitle")}
                      description={g.name}
                      submitLabel={t("deposit")}
                      successMessage={t("deposited")}
                      action={addContributionAction}
                      demo={demo}
                      hidden={{ goalId: g.id }}
                      fields={[
                        { name: "amount", label: t("amount"), type: "number", required: true, defaultValue: String(plan.perMonth || "") },
                        { name: "date", label: t("date"), type: "date", required: true, defaultValue: today },
                      ]}
                    />
                    <DeleteButton id={g.id} action={deleteGoalAction} demo={demo} successMessage={t("deleted")} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <SavingsCalculator />
    </>
  );
}
