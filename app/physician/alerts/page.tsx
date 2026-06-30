"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/config/route";
import { summarizeAlerts } from "@/features/alerts/service";
import { usePhysicianWorkspaceQuery } from "@/features/physician/hooks";
import { buildPhysicianDemoWorkspaceSnapshot } from "@/features/physician/service";
import { formatDateTime } from "@/lib/utils";
import type { Alert } from "@/types/alert";

function severityRank(level: Alert["level"]): number {
  switch (level) {
    case "critical":
      return 3;
    case "warning":
      return 2;
    case "info":
    default:
      return 1;
  }
}

function sortAlerts(alerts: Alert[]) {
  return [...alerts].sort((left, right) => {
    const bySeverity = severityRank(right.level) - severityRank(left.level);
    if (bySeverity !== 0) {
      return bySeverity;
    }

    return right.createdAt.getTime() - left.createdAt.getTime();
  });
}

export default function PhysicianAlertsPage() {
  const { data } = usePhysicianWorkspaceQuery();
  const workspace = data ?? buildPhysicianDemoWorkspaceSnapshot();
  const alerts = sortAlerts(workspace.alerts);
  const summary = summarizeAlerts(alerts);

  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Physician workspace"
        title="Alerts"
        description="Review the current clinical queue by severity, then work through each patient alert in priority order."
        meta={<span>Updated {formatDateTime(workspace.generatedAt)}</span>}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={ROUTES.PHYSICIAN.DASHBOARD}>Dashboard</Link>
            </Button>
            <Button asChild variant="glass">
              <Link href={ROUTES.PHYSICIAN.PATIENTS}>Patients</Link>
            </Button>
          </>
        }
        level={1}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">{summary.total}</CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">total</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">{summary.open}</CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">open</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">{summary.acknowledged}</CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">
              acknowledged
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-3xl">{summary.resolved}</CardTitle>
            <p className="m-0 text-sm text-[color:var(--ui-muted)]">resolved</p>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader className="gap-2">
          <CardTitle>Severity snapshot</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="destructive">
            {alerts.filter((alert) => alert.level === "critical").length} critical
          </Badge>
          <Badge variant="glass">
            {alerts.filter((alert) => alert.level === "warning").length} warning
          </Badge>
          <Badge variant="secondary">
            {alerts.filter((alert) => alert.level === "info").length} info
          </Badge>
          <Badge variant="outline">
            {summary.dismissed} dismissed
          </Badge>
        </CardContent>
      </Card>

      <section className="grid gap-4">
        {alerts.length > 0 ? (
          alerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
        ) : (
          <EmptyState
            icon={<TriangleAlert size={24} />}
            title="No alerts available."
            description="The review queue will appear here when the physician workspace has open clinical signals."
          />
        )}
      </section>
    </main>
  );
}
