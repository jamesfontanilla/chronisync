"use client";

import Link from "next/link";
import { ArrowRight, Mic, ShieldCheck, TriangleAlert } from "lucide-react";

import { AccountMenu } from "@/components/common/AccountMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardMetric } from "@/features/dashboard/service";

const visibleStatLabels = ["Unread alerts", "Stable vitals", "Pending uploads"];

export interface DashboardWorkspaceProps {
  metrics: readonly DashboardMetric[];
  generatedAtLabel: string;
}

export function DashboardWorkspace({
  metrics,
  generatedAtLabel,
}: DashboardWorkspaceProps) {
  const visibleMetrics = metrics.filter((metric) =>
    visibleStatLabels.includes(metric.label)
  );

  return (
    <section className="grid gap-4">
      <AccountMenu variant="greeting" />

      <div className="grid grid-cols-3 gap-3">
        {visibleMetrics.map((metric) => (
          <article
            key={metric.label}
            className="grid gap-1 rounded-[1.25rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-3 text-center"
          >
            <div className="font-[family-name:var(--font-display)] text-2xl tracking-[-0.04em]">
              {metric.value}
            </div>
            <div className="text-[0.65rem] uppercase leading-tight tracking-[0.14em] text-[color:var(--ui-muted)]">
              {metric.label}
            </div>
          </article>
        ))}
      </div>

      {/* ALERT SECTION */}
      <Card className="overflow-hidden border-[color:var(--ui-warning)] bg-[linear-gradient(135deg,rgba(180,35,35,0.08),rgba(180,35,35,0.03))]">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[color:var(--ui-warning)] bg-[color:var(--ui-warning-soft)] text-[color:var(--ui-warning)]">
              <TriangleAlert size={18} />
            </div>

            <div className="grid gap-2 pr-12 sm:pr-0">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl font-semibold text-[color:var(--ui-warning)]">
                  Clinical Alert: CKD & Diabetes Comorbid Risk
                </CardTitle>
                <Badge variant="destructive">Critical Alert</Badge>
              </div>
              <CardDescription className="text-sm font-medium text-[color:var(--ui-text)] mt-1">
                ⚠ Alert: Blood glucose trending upward over the past 7 days — GMI approaching threshold. Blood pressure elevated (Day 27: 142/90, above 140 systolic threshold).
              </CardDescription>
              <div className="text-xs text-[color:var(--ui-muted)] flex flex-wrap gap-x-4 gap-y-1 mt-1">
                <span><strong>Comorbidity:</strong> CKD Stage 3 + Type 2 Diabetes</span>
                <span>•</span>
                <span><strong>Triggered:</strong> Telemetry Rule G-32</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* AI SUMMARY SECTION */}
      <Card className="overflow-hidden border-[color:var(--ui-border)] bg-[linear-gradient(135deg,rgba(25,163,154,0.08),rgba(11,101,116,0.03))]">
        <CardHeader className="p-4 sm:p-6 pb-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs font-semibold">
              ✨ AI Summary
            </Badge>
            <CardDescription className="text-xs text-[color:var(--ui-muted)]">
              Based on 30-day care signals
            </CardDescription>
          </div>
          <CardTitle className="text-lg font-bold mt-2">
            30-Day Health Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="m-0 text-sm leading-7 text-[color:var(--ui-text)]">
            Your metrics show a gradual, persistent increase in blood glucose and a corresponding rise in systolic blood pressure over the past 30 days. In the context of your comorbid CKD and Type 2 Diabetes, these trends suggest that current self-management targets may need review. We suggest noting these patterns and considering discussing them with your care team at your next visit.
          </p>
        </CardContent>
      </Card>

      {/* QUICK ACTIONS */}
      <Card className="overflow-hidden">
        <CardHeader className="gap-1 border-b border-[color:var(--ui-border)] bg-[linear-gradient(135deg,rgba(25,163,154,0.08),rgba(11,101,116,0.03))] p-3 sm:p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--ui-muted)]">
            Quick actions
          </div>
          <CardTitle className="text-base">One tap away</CardTitle>
          <CardDescription className="text-xs">
            Log by voice, bring in a caregiver, or add a record.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-3 p-3 sm:p-4">
          <div className="grid grid-cols-3 gap-2">
            <Button
              asChild
              variant="glass"
              className="h-auto flex-col gap-1 py-3 text-xs"
            >
              <Link href="/patient/add#voice-first">
                <Mic className="h-4 w-4" />
                Voice log
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="h-auto flex-col gap-1 py-3 text-xs"
            >
              <Link href="/patient/partners">
                <ShieldCheck className="h-4 w-4" />
                Caregiver
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto flex-col gap-1 py-3 text-xs"
            >
              <Link href="/patient/add">
                <ArrowRight className="h-4 w-4" />
                Quick add
              </Link>
            </Button>
          </div>
          <Badge variant="outline" className="w-fit">
            {generatedAtLabel}
          </Badge>
        </CardContent>
      </Card>
    </section>
  );
}
