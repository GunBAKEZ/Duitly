"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatRupiah } from "@/lib/format";

export function CashflowChart({
  data,
  labels,
  locale,
}: {
  data: { day: string; income: number; expense: number }[];
  labels: { income: string; expense: string };
  locale: string;
}) {
  const config = {
    income: { label: labels.income, color: "var(--chart-1)" },
    expense: { label: labels.expense, color: "var(--chart-3)" },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="h-64 w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} />
        <ChartTooltip
          position={{ y: 0 }}
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <div className="flex w-full min-w-36 items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="size-2 rounded-[2px]" style={{ background: `var(--color-${name})` }} />
                    {config[name as keyof typeof config]?.label}
                  </span>
                  <span className="font-mono font-medium text-foreground tabular-nums">
                    {formatRupiah(Number(value), locale)}
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="income" fill="var(--color-income)" radius={6} isAnimationActive={false} />
        <Bar dataKey="expense" fill="var(--color-expense)" radius={6} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  );
}
