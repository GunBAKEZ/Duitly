"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useLocale, useTranslations } from "next-intl"

import { useIsMobile } from "@/hooks/use-mobile"
import { formatRupiah } from "@/lib/format"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export function ChartAreaInteractive({
  data: chartData,
  referenceDate,
}: {
  data: { date: string; income: number; expense: number }[]
  referenceDate: string
}) {
  const t = useTranslations("dashboard")
  const c = useTranslations("common")
  const locale = useLocale()
  const dateLocale = locale === "en" ? "en-US" : "id-ID"
  const chartConfig = {
    income: { label: c("income"), color: "var(--chart-1)" },
    expense: { label: c("expense"), color: "var(--chart-3)" },
  } satisfies ChartConfig
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const ref = new Date(referenceDate)
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(ref)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{t("cashflow")}</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">{t("cashflowSub")}</span>
          <span className="@[540px]/card:hidden">{t(`range${timeRange.replace("d", "")}` as "range90")}</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={timeRange ? [timeRange] : []}
            onValueChange={(value) => {
              setTimeRange(value[0] ?? "90d")
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">{t("range90")}</ToggleGroupItem>
            <ToggleGroupItem value="30d">{t("range30")}</ToggleGroupItem>
            <ToggleGroupItem value="7d">{t("range7")}</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(value) => {
              if (value !== null) {
                setTimeRange(value)
              }
            }}
          >
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder={t("range90")}>
                {(value: string | null) => t(`range${(value ?? "90d").replace("d", "")}` as "range90")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                {t("range90")}
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                {t("range30")}
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                {t("range7")}
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString(dateLocale, {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              position={{ y: 0 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString(dateLocale, {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  formatter={(value, name) => (
                    <div className="flex w-full min-w-36 items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="size-2 rounded-[2px]" style={{ background: `var(--color-${name})` }} />
                        {chartConfig[name as keyof typeof chartConfig]?.label}
                      </span>
                      <span className="font-mono font-medium text-foreground tabular-nums">
                        {formatRupiah(Number(value), locale)}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Area dataKey="expense" type="natural" fill="url(#fillExpense)" stroke="var(--color-expense)" />
            <Area dataKey="income" type="natural" fill="url(#fillIncome)" stroke="var(--color-income)" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
