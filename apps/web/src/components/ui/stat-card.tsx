import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card } from "./card";

/**
 * KPI tile. `delta` is a % change; `goodWhen` says whether up or down is good,
 * so color always carries an arrow + sign as well (never color alone).
 */
export function StatCard({
  label,
  value,
  delta,
  goodWhen = "up",
  hint,
  icon,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  delta?: number;
  goodWhen?: "up" | "down";
  hint?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  const up = (delta ?? 0) >= 0;
  const good = goodWhen === "up" ? up : !up;
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted">{label}</span>
        {icon && <span className="text-muted [&_svg]:size-4">{icon}</span>}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-fg">{value}</div>
      <div className="mt-1 flex items-center gap-1.5 text-xs">
        {delta !== undefined && (
          <span className={cn("inline-flex items-center font-medium", good ? "text-success" : "text-danger")}>
            {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {up ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
        )}
        {hint && <span className="text-muted">{hint}</span>}
      </div>
    </Card>
  );
}
