"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

export function ScoreGauge({ score, label }: { score: number; label: string }) {
  const color = score < 40 ? "var(--chart-4)" : score <= 70 ? "var(--chart-3)" : "var(--chart-5)";
  const config = { score: { label, color } } satisfies ChartConfig;
  return (
    <div className="relative mx-auto h-40 w-64">
      <ChartContainer config={config} className="h-full w-full">
        <RadialBarChart data={[{ score }]} startAngle={180} endAngle={0} innerRadius={90} outerRadius={120} cy="85%">
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} angleAxisId={0} />
          <RadialBar dataKey="score" background cornerRadius={10} fill={color} angleAxisId={0} isAnimationActive={false} />
        </RadialBarChart>
      </ChartContainer>
      <div className="absolute inset-x-0 bottom-2 text-center">
        <p className="text-4xl font-semibold">{score}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
