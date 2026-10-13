"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

export function CashflowChart({
  data,
  labels,
}: {
  data: { day: string; income: number; expense: number }[];
  labels: { income: string; expense: string };
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
        <ChartTooltip content={<ChartTooltipContent />} />
        
        <Bar dataKey="income" fill="var(--color-income)" radius={6} isAnimationActive={false} />
        <Bar dataKey="expense" fill="var(--color-expense)" radius={6} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  );
}
