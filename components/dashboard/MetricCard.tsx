"use client";

import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardMetric } from "@/features/dashboard/service";

export interface MetricCardProps {
  metric: DashboardMetric;
  icon?: ReactNode;
}

export function MetricCard({ metric, icon }: MetricCardProps) {
  const DeltaIcon =
    metric.direction === "up"
      ? ArrowUpRight
      : metric.direction === "down"
        ? ArrowDownRight
        : Minus;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="grid gap-2">
          <CardDescription>{metric.label}</CardDescription>
          <CardTitle className="text-3xl">{metric.value}</CardTitle>
        </div>

        {icon ? (
          <span className="inline-grid h-11 w-11 place-items-center rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]">
            {icon}
          </span>
        ) : null}
      </CardHeader>

      <CardContent className="grid gap-3 pt-0">
        {metric.detail ? (
          <p className="m-0 text-sm leading-6 text-[color:var(--ui-muted)]">
            {metric.detail}
          </p>
        ) : null}

        {metric.change ? (
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] px-3 py-1 text-sm font-medium text-[color:var(--ui-text)]">
            <DeltaIcon size={14} />
            <span>{metric.change}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
