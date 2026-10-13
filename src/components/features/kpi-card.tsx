import { Card, CardContent } from "@/components/ui/card";
import { DeltaBadge } from "./delta-badge";

export function KpiCard({ label, value, delta, hint }: { label: string; value: string; delta?: number; hint?: string }) {
  return (
    <Card>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {delta !== undefined && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <DeltaBadge value={delta} />
            {hint}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
