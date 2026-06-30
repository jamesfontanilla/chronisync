import type { ReactNode } from "react";
import { BellRing, ShieldAlert, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDateTime, humanize } from "@/lib/utils";
import type { Alert } from "@/types/alert";

export interface AlertCardProps {
  alert: Alert;
  actions?: ReactNode;
  className?: string;
}

function getLevelIcon(level: Alert["level"]) {
  switch (level) {
    case "critical":
      return ShieldAlert;
    case "warning":
      return TriangleAlert;
    case "info":
    default:
      return BellRing;
  }
}

function getLevelVariant(level: Alert["level"]) {
  switch (level) {
    case "critical":
      return "destructive" as const;
    case "warning":
      return "glass" as const;
    case "info":
    default:
      return "secondary" as const;
  }
}

export function AlertCard({
  alert,
  actions,
  className,
}: AlertCardProps) {
  const LevelIcon = getLevelIcon(alert.level);

  return (
    <Card className={className}>
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]">
            <LevelIcon size={18} />
          </div>

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl">{alert.title}</CardTitle>
              <Badge variant={getLevelVariant(alert.level)}>
                {humanize(alert.level)}
              </Badge>
              <Badge variant="outline">{humanize(alert.status)}</Badge>
            </div>
            <CardDescription>{alert.message}</CardDescription>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">
              {alert.metric ? `Metric: ${alert.metric}` : "Clinical alert"}
              {alert.ruleId ? ` | Rule: ${alert.ruleId}` : ""}
            </p>
          </div>
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
              Actual value
            </div>
            <div className="mt-2 text-lg font-semibold">
              {alert.actualValue ?? "N/A"}
            </div>
          </div>
          <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
              Threshold
            </div>
            <div className="mt-2 text-lg font-semibold">
              {alert.threshold ?? "N/A"}
            </div>
          </div>
          <div className="rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
              Created
            </div>
            <div className="mt-2 text-sm font-medium">
              {formatDateTime(alert.createdAt)}
            </div>
          </div>
        </div>

        {alert.notes ? (
          <>
            <Separator />
            <p className="m-0 text-sm leading-6 text-[color:var(--ui-muted)]">
              {alert.notes}
            </p>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
