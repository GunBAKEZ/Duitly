import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DeltaBadge({ value }: { value: number }) {
  const Icon = value >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <Badge variant={value >= 0 ? "success" : "warning"}>
      <Icon />
      {Math.abs(value)}%
    </Badge>
  );
}
