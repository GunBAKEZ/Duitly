import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type SectionCardItem = {
  label: string
  value: string
  delta?: number
  footer: string
  hint: string
}

export function SectionCards({ items }: { items: SectionCardItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {items.map((item) => {
        const up = (item.delta ?? 0) >= 0
        const Icon = up ? TrendingUpIcon : TrendingDownIcon
        return (
          <Card key={item.label} className="@container/card">
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
                {item.value}
              </CardTitle>
              {item.delta !== undefined && (
                <CardAction>
                  <Badge variant="outline">
                    <Icon />
                    {up ? "+" : "-"}
                    {Math.abs(item.delta)}%
                  </Badge>
                </CardAction>
              )}
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">{item.footer}</div>
              <div className="text-muted-foreground">{item.hint}</div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
