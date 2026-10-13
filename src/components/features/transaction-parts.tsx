import { ArrowDown, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function TransactionIcon({ type }: { type: "income" | "expense" }) {
  const income = type === "income";
  const Icon = income ? ArrowDown : ArrowUp;
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg",
        income ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-600",
      )}
    >
      <Icon className="size-4" />
    </span>
  );
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return <Badge variant={status === "pending" ? "warning" : "secondary"}>{label}</Badge>;
}

export function AmountText({ type, children }: { type: "income" | "expense"; children: React.ReactNode }) {
  return (
    <span className={cn("font-semibold", type === "income" && "text-emerald-600")}>
      {type === "income" ? "+" : "−"}
      {children}
    </span>
  );
}
