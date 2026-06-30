"use client";

import Link from "next/link";
import {
  Activity,
  BellRing,
  FileText,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PatientCard } from "@/components/dashboard/PatientCard";
import { TrendCard } from "@/components/dashboard/TrendCard";
import { SummaryPreview } from "@/components/ai/SummaryPreview";
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

const metricIcons = [Users, BellRing, FileText, Activity] as const;

function sortByNewest<T extends { createdAt: Date }>(items: T[]) {
  return [...items].sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
  );
}

export default function PhysicianDashboardPage() {
  const { data } = usePhysicianWorkspaceQuery();
  const workspace = data ?? buildPhysicianDemoWorkspaceSnapshot();
  const alertSummary = summarizeAlerts(workspace.alerts);
  const recentPatients = workspace.patientCards.slice(0, 2);
  const recentAlerts = sortByNewest(workspace.alerts).slice(0, 2);
  const recentSummaries = sortByNewest(workspace.summaries).slice(0, 2);

  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Physician workspace"
        title="Dashboard"
        description="A compact view of panel health, open alerts, and the latest care summaries."
        meta={<span>Updated {formatDateTime(workspace.generatedAt)}</span>}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={ROUTES.PHYSICIAN.PATIENTS}>Patients</Link>
            </Button>
            <Button asChild variant="glass">
              <Link href={ROUTES.PHYSICIAN.ALERTS}>Alerts</Link>
            </Button>
          </>
        }
        level={1}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {workspace.metrics.map((metric, index) => {
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
        {workspace.trends.map((series) => (
          <TrendCard key={series.title} series={series} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <Card>
          <CardHeader className="gap-2">
            <CardTitle>Patient watchlist</CardTitle>
            <p className="m-0 text-sm leading-6 text-[color:var(--ui-muted)]">
              The two most active patients in the panel.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4">
            {recentPatients.length > 0 ? (
              recentPatients.map(({ patient, summary }) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  summary={summary}
                />
              ))
            ) : (
              <EmptyState
                title="No assigned patients yet."
                description="Once the panel is seeded, the dashboard will surface each patient here."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-2">
            <CardTitle>Open alerts</CardTitle>
            <p className="m-0 text-sm leading-6 text-[color:var(--ui-muted)]">
              {alertSummary.open} open, {alertSummary.acknowledged} acknowledged.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4">
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
            ) : (
              <EmptyState
                title="No open alerts."
                description="The physician workspace will surface new clinical notifications here."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="gap-2">
            <CardTitle>Latest summaries</CardTitle>
            <p className="m-0 text-sm leading-6 text-[color:var(--ui-muted)]">
              Drafts and visit notes waiting for review.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4">
            {recentSummaries.length > 0 ? (
              recentSummaries.map((summary) => (
                <SummaryPreview key={summary.id} summary={summary} />
              ))
            ) : (
              <EmptyState
                title="No summaries waiting."
                description="Visit summaries will appear here once they are drafted or queued for approval."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-2">
            <CardTitle>Panel snapshot</CardTitle>
            <p className="m-0 text-sm leading-6 text-[color:var(--ui-muted)]">
              Quick counts for the current workspace.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {workspace.patientCards.length} patients
              </Badge>
              <Badge variant="secondary">{workspace.alerts.length} alerts</Badge>
              <Badge variant="secondary">
                {workspace.documents.length} documents
              </Badge>
              <Badge variant="secondary">
                {workspace.summaries.length} summaries
              </Badge>
            </div>
            <p>
              Review open alerts first, then documents, then the newest visit
              summaries.
            </p>
            <p>
              Live data falls back to a seeded demo workspace if Firestore is
              unavailable.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
