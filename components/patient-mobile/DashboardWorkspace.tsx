"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  ClipboardList,
  HeartPulse,
  Mic,
  ShieldCheck,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { TrendCard } from "@/components/dashboard/TrendCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  DashboardMetric,
  DashboardTrendSeries,
} from "@/features/dashboard/service";

type DashboardViewMode = "simple" | "detailed";
const metricIcons = [Activity, ShieldCheck, HeartPulse, ClipboardList] as const;

export interface DashboardWorkspaceProps {
  metrics: readonly DashboardMetric[];
  trends: readonly DashboardTrendSeries[];
  generatedAtLabel: string;
}

function getMetricValue(
  metrics: readonly DashboardMetric[],
  label: string,
  fallback = "0"
): string {
  return metrics.find((metric) => metric.label === label)?.value ?? fallback;
}

function buildSimpleSummary(metrics: readonly DashboardMetric[]): string {
  const openRecords = getMetricValue(metrics, "Open records", "0");
  const unreadAlerts = getMetricValue(metrics, "Unread alerts", "0");
  const stableVitals = getMetricValue(metrics, "Stable vitals", "0%");
  const pendingUploads = getMetricValue(metrics, "Pending uploads", "0");

  return `You have ${unreadAlerts} alerts to review and ${pendingUploads} uploads waiting. ${stableVitals} of recent vitals are steady, and ${openRecords} open records are ready when you want the fuller view.`;
}

export function DashboardWorkspace({
  metrics,
  trends,
  generatedAtLabel,
}: DashboardWorkspaceProps) {
  const [viewMode, setViewMode] = useState<DashboardViewMode>("simple");

  const simpleSummary = buildSimpleSummary(metrics);

  return (
    <section className="grid gap-6">
      <Card className="overflow-hidden">
        <CardHeader className="gap-3 border-b border-[color:var(--ui-border)] bg-[linear-gradient(135deg,rgba(25,163,154,0.08),rgba(11,101,116,0.03))]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="grid gap-2">
              <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--ui-muted)]">
                Accessibility first
              </div>
              <CardTitle className="text-2xl">
                Choose how you want to read this panel.
              </CardTitle>
              <CardDescription className="max-w-3xl">
                Simple view uses larger text and fewer moving parts. Detailed
                view keeps the chart grid for users who want the full trend
                story.
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={viewMode === "simple" ? "default" : "secondary"}
                aria-pressed={viewMode === "simple"}
                onClick={() => setViewMode("simple")}
              >
                Simple view
              </Button>
              <Button
                type="button"
                variant={viewMode === "detailed" ? "default" : "secondary"}
                aria-pressed={viewMode === "detailed"}
                onClick={() => setViewMode("detailed")}
              >
                Detailed view
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-wrap items-center gap-3">
          <Button asChild variant="glass" className="w-full sm:w-auto">
            <Link href="/patient/add#voice-first">
              <Mic className="h-4 w-4" />
              Voice log
            </Link>
          </Button>
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href="/patient/partners">
              <ShieldCheck className="h-4 w-4" />
              Open caregiver support
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/patient/add">
              Quick add
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Badge variant="outline">{generatedAtLabel}</Badge>
        </CardContent>
      </Card>

      {viewMode === "simple" ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
          <Card className="overflow-hidden">
            <CardHeader className="gap-2">
              <CardTitle className="text-3xl">Simple view</CardTitle>
              <CardDescription>
                Large text, fewer decisions, and no chart grid.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="m-0 text-lg leading-8 text-[color:var(--ui-text)]">
                {simpleSummary}
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {metrics.map((metric) => (
                  <article
                    key={metric.label}
                    className="grid gap-2 rounded-[1.5rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4"
                  >
                    <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ui-muted)]">
                      {metric.label}
                    </div>
                    <div className="font-[family-name:var(--font-display)] text-3xl tracking-[-0.04em]">
                      {metric.value}
                    </div>
                    {metric.detail ? (
                      <p className="m-0 text-sm leading-6 text-[color:var(--ui-muted)]">
                        {metric.detail}
                      </p>
                    ) : null}
                    {metric.change ? (
                      <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--ui-accent)]">
                        {metric.change}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="gap-2">
              <CardTitle className="text-2xl">What to do next</CardTitle>
              <CardDescription>
                The important actions stay on the same screen.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
              <div className="rounded-[1.35rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] p-4">
                <p className="m-0 font-medium text-[color:var(--ui-text)]">
                  Voice logging stays first.
                </p>
                <p className="m-0 mt-2">
                  Use the voice-first card when typing feels slow or tiring.
                </p>
              </div>

              <div className="rounded-[1.35rem] border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] p-4">
                <p className="m-0 font-medium text-[color:var(--ui-text)]">
                  Caregiver fallback remains one tap away.
                </p>
                <p className="m-0 mt-2">
                  Trusted helpers can step in when dexterity or vision gets in
                  the way.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/patient/add#voice-first">Start voice log</Link>
                </Button>
                <Button asChild variant="secondary" className="w-full sm:w-auto">
                  <Link href="/patient/partners">Get caregiver help</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric, index) => {
              const Icon = metricIcons[index % metricIcons.length]!;

              return (
                <MetricCard
                  key={metric.label}
                  metric={metric}
                  icon={<Icon size={18} />}
                />
              );
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            {trends.map((series) => (
              <TrendCard key={series.title} series={series} />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <Card>
              <CardHeader>
                <CardTitle>Workspace summary</CardTitle>
                <CardDescription>
                  The detailed mode keeps the big picture visible while the
                  simple mode stays ready for low-load reading.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
                <p>{simpleSummary}</p>
                <p>
                  Switch back to simple view when you want fewer decisions and
                  larger touch targets.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated at</CardTitle>
                <CardDescription>
                  Use this timestamp to judge whether the snapshot is current.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
                <p>{generatedAtLabel}</p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="glass" className="w-full sm:w-auto">
                    <Link href="/patient/add#voice-first">Voice log</Link>
                  </Button>
                  <Button
                    asChild
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    <Link href="/patient/partners">Get caregiver help</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </section>
  );
}
