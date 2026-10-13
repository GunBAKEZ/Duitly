"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRupiah } from "@/lib/format";
import { computeSavingsPlan } from "@/lib/services/savings-plan";

export function SavingsCalculator() {
  const t = useTranslations("savings");
  const c = useTranslations("common");
  const locale = useLocale();
  const [target, setTarget] = useState(12000000);
  const [months, setMonths] = useState(6);
  const [saved, setSaved] = useState(0);
  const plan = computeSavingsPlan({ targetAmount: target, saved, months });

  const rows = [
    { label: c("perDay"), value: plan.perDay },
    { label: c("perWeek"), value: plan.perWeek },
    { label: c("perMonth"), value: plan.perMonth },
    { label: c("perYear"), value: plan.perYear },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("calculator")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="target">{t("targetAmount")}</Label>
            <Input id="target" type="number" min={0} value={target} onChange={(e) => setTarget(Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="months">{t("months")}</Label>
            <Input id="months" type="number" min={1} value={months} onChange={(e) => setMonths(Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="saved">{t("saved")}</Label>
            <Input id="saved" type="number" min={0} value={saved} onChange={(e) => setSaved(Number(e.target.value))} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{t("needed")}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((r) => (
            <div key={r.label} className="rounded-lg border p-3">
              <p className="text-lg font-semibold">{formatRupiah(r.value, locale)}</p>
              <p className="text-xs text-muted-foreground">{r.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
